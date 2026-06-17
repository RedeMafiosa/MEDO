import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { clansApi } from '@/services/api';
import type { Clan } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Users, Zap, Crown, ArrowLeft, LogOut as LeaveIcon } from 'lucide-react';

export default function ClanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [clan, setClan] = useState<Clan | null>(null);
  const [members, setMembers] = useState<{ profile: { id: string; username: string | null; avatar_url: string | null; xp: number; rank?: { name: string; color: string; icon: string } } }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    const [c, m] = await Promise.all([clansApi.getById(id), clansApi.getMembers(id)]);
    setClan(c);
    setMembers(m as typeof members);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const isMyMember = members.some(m => m.profile.id === user?.id);
  const isLeader = clan?.leader_id === user?.id;

  const handleLeave = async () => {
    if (!user || !id) return;
    await clansApi.leave(id, user.id);
    await refreshProfile();
    toast.success('Você saiu do clan');
    navigate('/clans');
  };

  if (loading) return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-4">
        <Skeleton className="h-32 bg-muted" />
        <Skeleton className="h-64 bg-muted" />
      </div>
    </AppLayout>
  );

  if (!clan) return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">Clan não encontrado</div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate('/clans')}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        {/* Clan header */}
        <div className="border border-border bg-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="h-16 w-16 bg-secondary border border-primary/30 flex items-center justify-center shrink-0">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-black">{clan.name}</h1>
                <span className="font-mono text-sm text-primary bg-primary/10 px-2 py-0.5">[{clan.tag}]</span>
              </div>
              {clan.description && <p className="text-sm text-muted-foreground text-pretty mb-3">{clan.description}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{clan.member_count} membros</span>
                <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" />{clan.total_xp.toLocaleString()} XP total</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {user && isMyMember && !isLeader && (
                <Button variant="ghost" size="sm" onClick={handleLeave} className="gap-1.5 text-destructive hover:text-destructive border border-border">
                  <LeaveIcon className="h-4 w-4" /> Sair
                </Button>
              )}
              {user && !isMyMember && !profile?.clan_id && (
                <Button size="sm" className="font-bold" onClick={async () => {
                  await clansApi.join(clan.id, user.id);
                  await refreshProfile();
                  await load();
                  toast.success('Você entrou no clan!');
                }}>Entrar no Clan</Button>
              )}
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="border border-border bg-card p-6">
          <h2 className="font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Membros ({members.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground font-medium pb-2 pr-4 whitespace-nowrap">Jogador</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-2 pr-4 whitespace-nowrap">Rank</th>
                  <th className="text-right text-xs text-muted-foreground font-medium pb-2 whitespace-nowrap">XP</th>
                </tr>
              </thead>
              <tbody>
                {members.map(({ profile: p }) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-secondary text-primary text-xs font-bold">
                            {p.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{p.username || 'Jogador'}</span>
                        {clan.leader_id === p.id && (
                          <Badge className="text-xs px-1 py-0 bg-primary text-primary-foreground flex items-center gap-0.5">
                            <Crown className="h-2.5 w-2.5" /> Líder
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {p.rank ? (
                        <span className="text-sm" style={{ color: p.rank.color }}>{p.rank.icon} {p.rank.name}</span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <span className="text-sm font-bold stat-mono text-primary">{p.xp.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
