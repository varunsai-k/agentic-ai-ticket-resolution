import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Input } from '../components/ui';
import { ArrowLeft, Send, Sparkles, ShieldCheck, User, Check, Clock, AlertTriangle, FileText } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

interface Ticket {
  ticket_id: string;
  user_id: string;
  username: string;
  category: string;
  title_query: string;
  ticket_description: string;
  status: string; // 'Human Review' | 'Resolved' | 'AI Processing' | 'Manual Handling' | etc.
  priority: string;
  resolution_state: string;
  created_at: string;
  ai_response?: string;
  ai_confidence?: number;
  final_response?: string;
  resolved_by?: string;
  retrieved_documents?: string[] | any; // Could be JSON or array
}

interface Message {
  sender: 'client' | 'agent' | 'human';
  content: string;
  timestamp: Date;
  confidence?: number;
}

interface TicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
  currentUser: { username: string; id: string } | null;
}

// ==========================================
// LIGHTWEIGHT WORD-BY-WORD DIFF ENGINE (React replacement of Python difflib)
// ==========================================
function renderWordDiff(original: string, current: string) {
  if (original === current) return null;
  
  const originalWords = original.trim().split(/\s+/);
  const currentWords = current.trim().split(/\s+/);
  
  const diffElements: React.ReactNode[] = [];
  let i = 0;
  let j = 0;
  
  while (i < originalWords.length || j < currentWords.length) {
    if (i < originalWords.length && j < currentWords.length && originalWords[i] === currentWords[j]) {
      // Unchanged word
      diffElements.push(<span key={`eq-${i}-${j}`} className="text-foreground">{originalWords[i]} </span>);
      i++;
      j++;
    } else {
      // Simple edit block - match next occurrences or treat as replaced/added
      let matchIdx = -1;
      for (let k = j; k < Math.min(j + 5, currentWords.length); k++) {
        if (i < originalWords.length && originalWords[i] === currentWords[k]) {
          matchIdx = k;
          break;
        }
      }
      
      if (matchIdx !== -1) {
        // Words added before match
        for (let k = j; k < matchIdx; k++) {
          diffElements.push(<span key={`add-${k}`} className="text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">{currentWords[k]} </span>);
        }
        j = matchIdx;
      } else {
        // Word removed
        if (i < originalWords.length) {
          diffElements.push(<span key={`rem-${i}`} className="text-rose-400 line-through bg-rose-500/10 px-1 rounded">{originalWords[i]} </span>);
          i++;
        }
        // Word added
        if (j < currentWords.length) {
          diffElements.push(<span key={`add-new-${j}`} className="text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">{currentWords[j]} </span>);
          j++;
        }
      }
    }
  }
  
  return (
    <div className="p-4 rounded-xl border border-border bg-accent/20 text-xs leading-relaxed space-x-1">
      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Live Changes (Diff)</p>
      {diffElements}
    </div>
  );
}

export const TicketDetail = ({ ticket: initialTicket, onBack, currentUser }: TicketDetailProps) => {
  const { t } = useTranslation();
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [editedResponse, setEditedResponse] = useState(ticket.ai_response || '');
  const [actionResponse, setActionResponse] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync edits if the ticket response changes
  useEffect(() => {
    setEditedResponse(ticket.ai_response || '');
  }, [ticket.ai_response]);

  // Load chat and threads details
  const loadThread = async () => {
    const initialMsgs: Message[] = [
      {
        sender: 'client',
        content: ticket.ticket_description,
        timestamp: new Date(ticket.created_at || Date.now())
      }
    ];

    if (ticket.ai_response) {
      initialMsgs.push({
        sender: 'agent',
        content: ticket.ai_response,
        timestamp: new Date(ticket.created_at || Date.now()),
        confidence: ticket.ai_confidence || 0.88
      });
    }

    if (ticket.final_response) {
      initialMsgs.push({
        sender: 'human',
        content: ticket.final_response,
        timestamp: new Date()
      });
    }

    setMessages(initialMsgs);

    try {
      const response = await api.get(`/threads/thread?ticket_id=${ticket.ticket_id}`);
      if (response.data && response.data.thread_id) {
        setThreadId(response.data.thread_id);
      }
    } catch (err) {
      console.log('No thread loaded', err);
    }
  };

  useEffect(() => {
    loadThread();
  }, [ticket.ticket_id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Parse Knowledge Sources safely (supports arrays or JSON strings)
  const getKnowledgeSources = (): string[] => {
    if (!ticket.retrieved_documents) return [];
    if (Array.isArray(ticket.retrieved_documents)) return ticket.retrieved_documents;
    try {
      if (typeof ticket.retrieved_documents === 'string') {
        return JSON.parse(ticket.retrieved_documents);
      }
    } catch {
      return [ticket.retrieved_documents.toString()];
    }
    return [];
  };

  // Approve response (Resume Graph or Close Ticket)
  const handleApproveResolution = async (approvedText: string) => {
    if (!approvedText.trim()) return;
    setLoadingAction(true);
    try {
      const token = localStorage.getItem('token') || '';

      if (threadId) {
        const payload = {
          thread_id: threadId,
          final_response: approvedText,
          user_id: currentUser?.id || 'human_agent_1',
          username: currentUser?.username || 'demo',
          token: token
        };
        await api.post('/agent/resume', payload);
      }

      const form = new FormData();
      form.append('ticket_id', ticket.ticket_id);
      form.append('final_response', approvedText);
      await api.post('/tickets/update', form);

      setMessages(prev => [
        ...prev,
        {
          sender: 'human',
          content: approvedText,
          timestamp: new Date()
        }
      ]);

      const refreshResponse = await api.get('/tickets/');
      const freshTicket = refreshResponse.data.find((t: any) => t.ticket_id === ticket.ticket_id);
      if (freshTicket) setTicket(freshTicket);

      setActionResponse('');
    } catch (err) {
      console.error(err);
      alert(t('detail.chat.error'));
    } finally {
      setLoadingAction(false);
    }
  };

  const isClosed = ticket.status === 'Resolved' || ticket.resolution_state === 'Closed';
  const docs = getKnowledgeSources();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Back controls */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack} 
          className="h-12 w-12 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground font-mono bg-accent/30 px-2 py-0.5 rounded border border-border/20">
              #{ticket.ticket_id.slice(0, 8)}
            </span>
            <Badge variant={ticket.priority === 'High' ? 'destructive' : ticket.priority === 'Medium' ? 'warning' : 'outline'}>
              {ticket.priority === 'High' ? t('tickets.priority.high') : ticket.priority === 'Medium' ? t('tickets.priority.medium') : t('tickets.priority.normal')}
            </Badge>
            <Badge variant={isClosed ? 'success' : 'warning'}>
              {ticket.status}
            </Badge>
          </div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground mt-1">
            {ticket.title_query}
          </h2>
        </div>
      </div>

      {/* =========================================================================
          DYNAMIC VIEWS BASED ON STATE (PRESENTS AND UPGRADES ALL ORIGINAL STYLES)
          ========================================================================= */}

      {/* 1. STATE: MANUAL HANDLING */}
      {ticket.status === 'Manual Handling' && (
        <Card className="border border-destructive/30 bg-destructive/5 glass relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center space-x-2 text-destructive-foreground uppercase tracking-wider">
              <AlertTriangle size={16} />
              <span>Escalated to Manual Human Evaluation</span>
            </CardTitle>
            <CardDescription className="text-xs text-destructive-foreground/70">
              This incident was escalated because of its critical urgency levels or priority overrides.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 pt-4 text-xs font-semibold">
            <div className="p-3 bg-background/50 rounded-xl border border-border/50">
              <span className="text-muted-foreground uppercase text-[10px]">Urgency</span>
              <p className="text-sm text-foreground mt-1 font-bold">{ticket.priority || 'Critical'}</p>
            </div>
            <div className="p-3 bg-background/50 rounded-xl border border-border/50">
              <span className="text-muted-foreground uppercase text-[10px]">Assigned Agent</span>
              <p className="text-sm text-foreground mt-1 font-bold">{ticket.resolved_by || 'Sai (Humano)'}</p>
            </div>
            <div className="p-3 bg-background/50 rounded-xl border border-border/50">
              <span className="text-muted-foreground uppercase text-[10px]">SLA Response Remaining</span>
              <p className="text-sm text-rose-400 mt-1 font-bold flex items-center">
                <Clock size={12} className="mr-1 animate-pulse" />
                15 Mins
              </p>
            </div>
            <div className="p-3 bg-background/50 rounded-xl border border-border/50">
              <span className="text-muted-foreground uppercase text-[10px]">Evaluation Category</span>
              <p className="text-sm text-foreground mt-1 font-bold">{ticket.category}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. STATE: AI PROCESSING */}
      {ticket.status === 'AI Processing' && (
        <Card className="border border-primary/20 bg-primary/5 glass relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center space-x-2 text-primary uppercase tracking-wider">
              <Sparkles size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
              <span>AI Agent Currently Processing Response</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              LangGraph nodes are currently crawling knowledge index databases.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Generating answer</span>
                <span className="text-primary animate-pulse">70% Completed</span>
              </div>
              <div className="w-full bg-accent/40 h-2.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[70%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. STATE: RESOLVED */}
      {isClosed && (
        <Card className="border border-emerald-500/30 bg-emerald-500/5 glass relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center space-x-2 text-emerald-400 uppercase tracking-wider">
              <ShieldCheck size={16} />
              <span>Incident Successfully Resolved</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 pt-4 text-xs font-semibold">
            <div className="p-3 bg-background/50 rounded-xl border border-border/50">
              <span className="text-muted-foreground uppercase text-[10px]">Resolved By</span>
              <p className="text-sm text-emerald-400 mt-1 font-bold">{ticket.resolved_by || 'AI+Human'}</p>
            </div>
            <div className="p-3 bg-background/50 rounded-xl border border-border/50 col-span-1 md:col-span-2">
              <span className="text-muted-foreground uppercase text-[10px]">Resolved Date / SLA Closed</span>
              <p className="text-sm text-foreground mt-1 font-bold">{ticket.created_at || 'Just Now'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Summary, Confidence and Knowledge Base references */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Metadata Card */}
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('detail.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-semibold p-6">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('detail.client')}</span>
                <p className="text-sm text-foreground mt-1 font-bold">{ticket.username}</p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">UID: {ticket.user_id}</p>
              </div>

              <div className="border-t border-border/30 pt-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('detail.category')}</span>
                <p className="text-sm text-foreground mt-1 font-bold">{ticket.category}</p>
              </div>

              {ticket.ai_confidence !== undefined && (
                <div className="border-t border-border/30 pt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>{t('detail.confidence.label')}</span>
                    <span className={ticket.ai_confidence > 0.8 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {Math.round(ticket.ai_confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-accent/40 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${ticket.ai_confidence > 0.8 ? 'bg-emerald-400 shadow-md shadow-emerald-400/20' : 'bg-amber-400 shadow-md shadow-amber-400/20'}`} 
                      style={{ width: `${ticket.ai_confidence * 100}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground/70 leading-relaxed mt-1">
                    {ticket.ai_confidence > 0.8 
                      ? t('detail.confidence.optimal') 
                      : t('detail.confidence.low')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Knowledge Sources Card */}
          {docs.length > 0 && (
            <Card className="glass">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                  <FileText size={14} />
                  <span>Knowledge Base (retrieved)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5">
                {docs.map((doc, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 rounded-xl border border-cyan-500/10 bg-cyan-500/5 text-xs text-foreground leading-normal flex items-start space-x-2"
                  >
                    <span className="mt-0.5 text-cyan-400">📗</span>
                    <span className="font-semibold text-neutral-200">{doc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>

        {/* RIGHT COLUMN: Chat Timeline Auditor & Response editor */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Resolution / Audit Work area */}
          {!isClosed && ticket.status === 'Human Review' && (
            <Card className="glass">
              <CardHeader className="border-b border-border/30 pb-3">
                <CardTitle className="text-sm font-bold flex items-center space-x-2">
                  <Clock size={16} className="text-primary" />
                  <span>Auditoría Humana & Editor de Respuestas</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Modifica la respuesta de la IA antes de enviársela al cliente. Abajo verás los cambios en tiempo real.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                
                {/* Text Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Respuesta del Agente</label>
                  <textarea
                    value={editedResponse}
                    onChange={(e) => setEditedResponse(e.target.value)}
                    className="flex w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 min-h-[160px] resize-y"
                  />
                </div>

                {/* Diff Viewer panel */}
                {renderWordDiff(ticket.ai_response || '', editedResponse)}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleApproveResolution(editedResponse)}
                    className="flex-1 h-12"
                    variant="primary"
                    loading={loadingAction}
                  >
                    <Check size={16} className="mr-2" />
                    ✏️ Edit & Approve
                  </Button>
                  <Button
                    onClick={() => handleApproveResolution(ticket.ai_response || '')}
                    className="flex-1 h-12"
                    variant="outline"
                    loading={loadingAction}
                  >
                    <ShieldCheck size={16} className="mr-2" />
                    ✅ Approve Instantly
                  </Button>
                </div>

              </CardContent>
            </Card>
          )}

          {/* Conversation History Drawer */}
          <Card className="glass flex flex-col h-[520px] overflow-hidden">
            <CardHeader className="border-b border-border/30 py-4 shrink-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">{t('detail.chat.title')}</CardTitle>
                <CardDescription className="text-[10px]">{t('detail.chat.desc')}</CardDescription>
              </div>
              <Badge variant={isClosed ? 'success' : 'warning'} className="h-6">
                {isClosed ? t('detail.chat.closed') : t('detail.chat.active')}
              </Badge>
            </CardHeader>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg, index) => {
                const isClient = msg.sender === 'client';
                const isAgent = msg.sender === 'agent';
                
                return (
                  <div key={index} className={`flex ${isClient ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}>
                    <div className={`flex items-start max-w-[85%] md:max-w-[75%] gap-2.5 ${isClient ? 'flex-row' : 'flex-row-reverse'}`}>
                      
                      {/* Avatar */}
                      <div className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                        isClient 
                          ? 'bg-accent border border-border' 
                          : isAgent 
                            ? 'bg-primary/20 text-primary border border-primary/30 animate-pulse' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isClient ? <User size={14} /> : isAgent ? <Sparkles size={14} /> : <Check size={14} />}
                      </div>

                      {/* Bubble */}
                      <div className={`rounded-2xl p-4 text-sm leading-relaxed ${
                        isClient 
                          ? 'bg-accent/40 border border-border/50 rounded-tl-none text-foreground' 
                          : isAgent 
                            ? 'bg-primary/10 border border-primary/20 text-primary-foreground rounded-tr-none' 
                            : 'bg-emerald-500/10 border border-emerald-500/20 text-foreground rounded-tr-none'
                      }`}>
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            {isClient ? ticket.username : isAgent ? t('detail.chat.agent') : t('detail.chat.human')}
                          </span>
                          <span className="text-[9px] text-muted-foreground/60">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="whitespace-pre-line text-xs font-medium">{msg.content}</p>

                        {isAgent && msg.confidence !== undefined && (
                          <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-primary/10 text-[10px] font-semibold text-primary">
                            <ShieldCheck size={12} />
                            <span>{t('detail.confidence.label')}: {Math.round(msg.confidence * 100)}%</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-border/30 bg-background/20 shrink-0">
              {isClosed ? (
                <div className="flex items-center justify-center p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center">
                  <ShieldCheck size={16} className="mr-2 shrink-0" />
                  {t('detail.chat.resolved_banner')}
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApproveResolution(actionResponse);
                  }}
                  className="space-y-3"
                >
                  {/* Quick-action suggested answer panel */}
                  {ticket.ai_response && !actionResponse && (
                    <div className="p-3.5 rounded-xl border border-primary/15 bg-primary/5 space-y-2">
                      <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{t('detail.chat.suggested')}</p>
                      <button 
                        type="button"
                        onClick={() => setActionResponse(ticket.ai_response || '')}
                        className="text-left text-[11px] font-medium text-muted-foreground hover:text-foreground line-clamp-3 leading-normal cursor-pointer"
                      >
                        {ticket.ai_response}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Input
                      type="text"
                      placeholder={t('detail.chat.placeholder')}
                      value={actionResponse}
                      onChange={(e) => setActionResponse(e.target.value)}
                      className="flex-1 h-12"
                      required
                    />
                    <Button 
                      type="submit" 
                      className="h-12 w-12 rounded-xl shrink-0 p-0" 
                      loading={loadingAction}
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                </form>
              )}
            </div>

          </Card>

        </div>

      </div>

    </div>
  );
};
