import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { profilesApi, ranksApi } from '@/services/api';
import type { Profile, Rank } from '@/types/index';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BarChart3, Zap } from 'lucide-react';
import { MemberTag } from '@/components/ui/member-tag';

export default function RankingPage() {
  const [players, setPlayers] = useState<Profile[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, r] = await Promise.all([profilesApi.getRanking(100), ranksApi.getAll()]);
      setPlayers(p);
      setRanks(r);
      setLoading(false);
    };
    load();
  }, []);

  const rankGroups = ranks.map(rank => ({
    rank,
    players: players.filter(p => p.rank_id === rank.id),
  })).filter(g => g.players.length > 0);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Ranking Global
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Os melhores jogadores da plataforma</p>
        </div>

        {/* Rank tiers */}
        <div className="overflow-x-auto mb-8">
          <div className="flex gap-3 min-w-max pb-2">
            {ranks.map(rank => (
              <div key={rank.id} className="border border-border bg-card px-4 py-2 flex items-center gap-2">
                <span className="text-lg">{rank.icon}</span>
                <div>
                  <p className="text-xs font-bold" style={{ color: rank.color }}>{rank.name}</p>
                  <p className="text-xs text-muted-foreground stat-mono">{rank.min_xp.toLocaleString()} XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {Array(20).fill(0).map((_, i) => <Skeleton key={i} className="h-14 bg-muted" />)}
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-16 border border-border text-muted-foreground">
            <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum jogador no ranking ainda</p>
          </div>
        ) : (
          <div className="border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="text-left text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">#</th>
                    <th className="text-left text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">Jogador</th>
                    <th className="text-left text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">Rank</th>
                    <th className="text-right text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">XP</th>
                    <th className="text-right text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">Moedas</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-black stat-mono text-sm ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {i === 0 ? '👑' : i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Link to={`/profile/${p.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs bg-secondary text-primary font-bold">
                              {p.username?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{p.username || 'Jogador'}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.rank ? (
                          <MemberTag variant="rank" label={`${p.rank.icon ?? ''} ${p.rank.name}`.trim()} color={p.rank.color} size="sm" />
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                        {p.role === 'admin' && (
                          <MemberTag variant="admin" label="Admin" size="sm" className="ml-1.5" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="text-sm font-bold stat-mono text-primary flex items-center justify-end gap-1">
                          <Zap className="h-3 w-3" />{p.xp.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="text-sm stat-mono text-muted-foreground">{p.coins.toLocaleString()} 🪙</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
