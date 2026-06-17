import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { tournamentsApi } from '@/services/api';
import type { Tournament, TournamentRegistration } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Trophy, Users, Calendar, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const statusLabel: Record<string, string> = {
  open: 'Aberto', ongoing: 'Em Andamento', finished: 'Finalizado', cancelled: 'Cancelado',
};
const statusColor: Record<string, string> = {
  open: 'bg-primary text-primary-foreground',
  ongoing: 'bg-accent text-accent-foreground',
  finished: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const load = async () => {
    if (!id) return;
    const [t, regs] = await Promise.all([
      tournamentsApi.getById(id),
      tournamentsApi.getRegistrations(id),
    ]);
    setTournament(t);
    setRegistrations(regs);
    if (user) setIsRegistered(await tournamentsApi.isRegistered(id, user.id));
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, user]);

  const handleRegister = async () => {
    if (!user || !id) { toast.error('Faça login para se inscrever'); return; }
    if (!tournament || tournament.status !== 'open') { toast.error('Inscrições fechadas'); return; }
    if (tournament.participant_count >= tournament.max_participants) { toast.error('Torneio cheio'); return; }
    setRegistering(true);
    try {
      await tournamentsApi.register(id, user.id);
      setIsRegistered(true);
      await load();
      toast.success('Inscrição realizada com sucesso!');
    } catch {
      toast.error('Erro ao se inscrever');
    }
    setRegistering(false);
  };

  const handleUnregister = async () => {
    if (!user || !id) return;
    await tournamentsApi.unregister(id, user.id);
    setIsRegistered(false);
    await load();
    toast.success('Inscrição cancelada');
  };

  if (loading) return <AppLayout><div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-4"><Skeleton className="h-48 bg-muted" /><Skeleton className="h-64 bg-muted" /></div></AppLayout>;
  if (!tournament) return <AppLayout><div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">Torneio não encontrado</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate('/tournaments')}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <div className="border border-border bg-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="h-14 w-14 bg-secondary border border-primary/30 flex items-center justify-center shrink-0">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-xl font-black text-balance">{tournament.name}</h1>
                <Badge className={statusColor[tournament.status]}>{statusLabel[tournament.status]}</Badge>
              </div>
              {tournament.description && <p className="text-sm text-muted-foreground text-pretty mb-3">{tournament.description}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <span className="font-mono font-medium text-foreground">{tournament.game}</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{tournament.participant_count}/{tournament.max_participants} inscritos</span>
                {tournament.start_date && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(tournament.start_date).toLocaleDateString('pt-BR')}</span>}
                {tournament.prize && <span className="text-primary font-semibold">{tournament.prize}</span>}
              </div>
              {tournament.rules && (
                <div className="border border-border bg-secondary p-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1 uppercase tracking-wider text-xs">Regras</p>
                  <p className="text-pretty">{tournament.rules}</p>
                </div>
              )}
            </div>
            <div className="shrink-0">
              {tournament.status === 'open' && user && (
                isRegistered ? (
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-1.5 text-sm text-primary font-medium">
                      <CheckCircle className="h-4 w-4" /> Inscrito
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleUnregister} className="text-xs border border-border text-muted-foreground hover:text-destructive hover:border-destructive">Cancelar Inscrição</Button>
                  </div>
                ) : (
                  <Button onClick={handleRegister} disabled={registering || tournament.participant_count >= tournament.max_participants} className="font-bold">
                    {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : 'INSCREVER-SE'}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="border border-border bg-card p-6">
          <h2 className="font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Participantes ({registrations.length})
          </h2>
          {registrations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum participante inscrito ainda</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {registrations.map(r => (
                <div key={r.id} className="flex items-center gap-2 p-2 border border-border bg-secondary">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-xs bg-muted text-primary font-bold">
                      {(r as unknown as { profile: { username: string } }).profile?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium truncate">{(r as unknown as { profile: { username: string } }).profile?.username || 'Jogador'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
