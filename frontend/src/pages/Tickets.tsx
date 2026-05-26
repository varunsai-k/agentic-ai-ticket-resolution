import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Badge, Button, Input } from '../components/ui';
import { Search, ChevronRight, RefreshCw, Ticket as TicketIcon } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

interface Ticket {
  ticket_id: string;
  user_id: string;
  username: string;
  category: string;
  title_query: string;
  ticket_description: string;
  status: string;
  priority: string;
  resolution_state: string;
  created_at: string;
  ai_confidence?: number;
}

interface TicketsProps {
  onSelectTicket: (ticket: Ticket) => void;
}

export const Tickets = ({ onSelectTicket }: TicketsProps) => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'resolved'>('all');
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/tickets/');
      setTickets(response.data || []);
    } catch (err: any) {
      console.error(err);
      setError('Connection error. Failed to retrieve incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    // Search filter
    const matchesSearch = 
      ticket.title_query.toLowerCase().includes(search.toLowerCase()) ||
      ticket.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.username.toLowerCase().includes(search.toLowerCase());

    // Tab filter
    if (filterTab === 'pending') {
      return matchesSearch && (ticket.status === 'Escalated' || ticket.status === 'Pending' || ticket.status === 'Running');
    }
    if (filterTab === 'resolved') {
      return matchesSearch && (ticket.status === 'Resolved' || ticket.resolution_state === 'Closed');
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{t('tickets.title')}</h2>
          <p className="text-xs text-muted-foreground">{t('tickets.desc')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets} className="self-start sm:self-center h-10">
          <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t('tickets.sync')}
        </Button>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        
        {/* Tab pills */}
        <div className="flex bg-accent/40 border border-border/30 p-1.5 rounded-xl self-start gap-1">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              filterTab === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tickets.filter.all')} ({tickets.length})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              filterTab === 'pending'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tickets.filter.pending')} ({tickets.filter(t => t.status !== 'Resolved' && t.resolution_state !== 'Closed').length})
          </button>
          <button
            onClick={() => setFilterTab('resolved')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              filterTab === 'resolved'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tickets.filter.resolved')} ({tickets.filter(t => t.status === 'Resolved' || t.resolution_state === 'Closed').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('tickets.search.placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

      </div>

      {/* Ticket List (Mobile Cards & Desktop Table optimized) */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 w-full bg-accent/20 animate-pulse rounded-xl border border-border/30" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center border border-destructive/20 bg-destructive/10 rounded-xl">
          <p className="text-sm font-semibold text-destructive-foreground">{error}</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/60 rounded-xl bg-card/10">
          <TicketIcon size={40} className="text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">{t('tickets.empty.title')}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">{t('tickets.empty.desc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map(ticket => (
            <div
              key={ticket.ticket_id}
              onClick={() => onSelectTicket(ticket)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-border/60 bg-card/30 hover:bg-card/70 hover:border-primary/40 transition-all duration-200 cursor-pointer active:scale-[0.99] gap-4"
              style={{ minHeight: '80px' }} // Highly comfortable touch target
            >
              
              {/* Left Column info */}
              <div className="space-y-1.5 overflow-hidden">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground font-mono bg-accent/40 px-2 py-0.5 rounded border border-border/30">
                    #{ticket.ticket_id.slice(0, 8)}
                  </span>
                  
                  <Badge variant={ticket.priority === 'High' ? 'destructive' : ticket.priority === 'Medium' ? 'warning' : 'outline'}>
                    {ticket.priority === 'High' ? t('tickets.priority.high') : ticket.priority === 'Medium' ? t('tickets.priority.medium') : t('tickets.priority.normal')}
                  </Badge>

                  <Badge variant={ticket.status === 'Resolved' || ticket.resolution_state === 'Closed' ? 'success' : 'warning'}>
                    {ticket.status}
                  </Badge>

                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                    {ticket.category}
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {ticket.title_query}
                </h3>
                
                <p className="text-xs text-muted-foreground truncate max-w-2xl">
                  {ticket.ticket_description}
                </p>
              </div>

              {/* Right Column navigation helper */}
              <div className="flex items-center justify-between sm:justify-end shrink-0 border-t border-border/20 pt-3 sm:pt-0 sm:border-0">
                <div className="sm:hidden text-[10px] text-muted-foreground">
                  {t('tickets.client_label')}: <span className="font-semibold text-foreground">{ticket.username}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="hidden sm:inline text-xs font-semibold text-muted-foreground bg-accent/30 px-3 py-1.5 rounded-lg border border-border/20">
                    {ticket.username}
                  </span>
                  <div className="h-10 w-10 rounded-full bg-accent/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 flex items-center justify-center text-muted-foreground border border-border/40">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
