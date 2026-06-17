import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { tournamentsApi } from '@/services/api';
import type { Tournament } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Users, Calendar, ChevronRight } from 'lucide-react';

const statusLabel: Record<string, string> = {
  open: 'Aberto', ongoing: 'Em Andamento', finished: 'Finalizado', cancelled: 'Cancelado',
};
const statusColor: Record<string, string> = {
  open: 'bg-primary text-primary-foreground',
  ongoing: 'bg-accent text-accent-foreground',
  finished: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await tournamentsApi.getAll(statusFilter, 0, 50);
      setTournaments(data);
      setLoading(false);
    };
    load();
  }, [statusFilter]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" /> Torneios
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Compita pelos melhores prêmios</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-secondary border-border">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Abertos</SelectItem>
              <SelectItem value="ongoing">Em Andamento</SelectItem>
              <SelectItem value="finished">Finalizados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-28 bg-muted" />)}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-16 border border-border text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum torneio encontrado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tournaments.map(t => (
              <Link key={t.id} to={`/tournaments/${t.id}`}>
                <div className="border border-border bg-card hover:border-primary/50 transition-colors p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-base text-balance">{t.name}</h3>
                        <Badge className={`text-xs ${statusColor[t.status]}`}>{statusLabel[t.status]}</Badge>
                      </div>
                      {t.description && <p className="text-sm text-muted-foreground text-pretty line-clamp-1 mb-2">{t.description}</p>}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="font-mono font-medium">{t.game}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t.participant_count}/{t.max_participants}</span>
                        {t.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(t.start_date).toLocaleDateString('pt-BR')}</span>}
                        {t.prize && <span className="text-primary font-semibold">{t.prize}</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 hidden sm:block" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
