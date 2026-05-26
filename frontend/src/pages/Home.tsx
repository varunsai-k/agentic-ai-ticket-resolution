import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '../components/ui';
import { Activity, CheckCircle, Clock, AlertCircle, TrendingUp, Cpu } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

interface Ticket {
  ticket_id: string;
  username: string;
  category: string;
  title_query: string;
  status: string;
  priority: string;
  resolution_state: string;
  ai_confidence?: number;
}

interface HomeProps {
  onViewTickets: () => void;
}

export const Home = ({ onViewTickets }: HomeProps) => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tickets/');
      setTickets(response.data || []);
    } catch (err: any) {
      console.error('Failed to load performance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalTickets = tickets.length;
  const resolved = tickets.filter(t => t.status === 'Resolved' || t.resolution_state === 'Closed').length;
  const pendingReview = tickets.filter(t => t.status === 'Escalated' || t.status === 'Pending').length;
  const averageConfidence = tickets.length > 0 
    ? (tickets.reduce((acc, curr) => acc + (curr.ai_confidence || 0.85), 0) / tickets.length) * 100
    : 85;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 via-violet-950/20 to-card p-6 md:p-8 border border-primary/20 shadow-xl">
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Cpu size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
              <span>{t('home.badge')}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('home.title')}</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              {t('home.desc')}
            </p>
          </div>
          <Button onClick={onViewTickets} className="shrink-0">
            {t('home.btn')}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        <Card className="glass relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('home.stats.total')}</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Activity size={16} />
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {loading ? (
              <div className="h-9 w-12 bg-accent/40 animate-pulse rounded" />
            ) : (
              <div className="text-2xl md:text-3xl font-bold tracking-tight">{totalTickets}</div>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">{t('home.stats.total.sub')}</p>
          </CardContent>
        </Card>

        <Card className="glass relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('home.stats.resolved')}</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle size={16} />
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {loading ? (
              <div className="h-9 w-12 bg-accent/40 animate-pulse rounded" />
            ) : (
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-400">{resolved}</div>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              {totalTickets > 0 ? Math.round((resolved / totalTickets) * 100) : 0}% {t('home.stats.resolved.sub')}
            </p>
          </CardContent>
        </Card>

        <Card className="glass relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('home.stats.review')}</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock size={16} />
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {loading ? (
              <div className="h-9 w-12 bg-accent/40 animate-pulse rounded" />
            ) : (
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-amber-400">{pendingReview}</div>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">{t('home.stats.review.sub')}</p>
          </CardContent>
        </Card>

        <Card className="glass relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('home.stats.confidence')}</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <TrendingUp size={16} />
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {loading ? (
              <div className="h-9 w-12 bg-accent/40 animate-pulse rounded" />
            ) : (
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-violet-400">
                {Math.round(averageConfidence)}%
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">{t('home.stats.confidence.sub')}</p>
          </CardContent>
        </Card>

      </div>

      {/* Main Grid for recent list or diagnostic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Urgent Incident list */}
        <Card className="lg:col-span-2 glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">{t('home.critical.title')}</CardTitle>
                <CardDescription className="text-xs">{t('home.critical.desc')}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onViewTickets} className="h-9 text-xs">
                {t('home.critical.view_all')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-16 w-full bg-accent/30 animate-pulse rounded-lg border border-border/40" />
              ))
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <AlertCircle size={28} className="mb-2 text-muted-foreground/50" />
                <p className="text-xs font-medium">{t('home.critical.empty')}</p>
              </div>
            ) : (
              tickets.slice(0, 4).map(ticket => (
                <div 
                  key={ticket.ticket_id} 
                  className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background/40 hover:bg-background/80 transition-all duration-200"
                >
                  <div className="space-y-1 overflow-hidden pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-muted-foreground font-mono">#{ticket.ticket_id.slice(0, 8)}</span>
                      <Badge variant={ticket.priority === 'High' ? 'destructive' : ticket.priority === 'Medium' ? 'warning' : 'outline'}>
                        {ticket.priority === 'High' ? t('tickets.priority.high') : ticket.priority === 'Medium' ? t('tickets.priority.medium') : t('tickets.priority.normal')}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground truncate">{ticket.category}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">{ticket.title_query}</p>
                  </div>
                  
                  <Badge variant={ticket.status === 'Resolved' || ticket.resolution_state === 'Closed' ? 'success' : 'warning'}>
                    {ticket.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI System status */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t('home.agent_health.title')}</CardTitle>
            <CardDescription className="text-xs">{t('home.agent_health.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{t('home.agent_health.latency')}</span>
                <span className="text-emerald-400">{t('home.agent_health.latency.status')}</span>
              </div>
              <div className="w-full bg-accent/40 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[95%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{t('home.agent_health.vector')}</span>
                <span className="text-primary">{t('home.agent_health.vector.status')}</span>
              </div>
              <div className="w-full bg-accent/40 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[80%]" />
              </div>
            </div>

            <div className="border-t border-border/40 pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">{t('home.agent_health.autonomous')}</span>
                <span className="font-bold text-foreground">78%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">{t('home.agent_health.escalations')}</span>
                <span className="font-bold text-foreground">22%</span>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

    </div>
  );
};
