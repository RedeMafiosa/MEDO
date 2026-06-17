import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { tournamentsApi, streamsApi, profilesApi } from '@/services/api';
import type { Tournament, Stream, Profile } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Trophy, Radio, Swords, Users, Crown, ChevronRight, Zap,
  Home, Shield, ShoppingBag, BarChart3, ChevronDown, Settings,
} from 'lucide-react';

const statusLabel: Record<string, string> = {
  open: 'Aberto', ongoing: 'Em Andamento', finished: 'Finalizado', cancelled: 'Cancelado',
};
const statusColor: Record<string, string> = {
  open: 'bg-primary text-primary-foreground',
  ongoing: 'bg-accent text-accent-foreground',
  finished: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

// ─── Sidebar nav config ────────────────────────────────────────────────────────
const sidebarSections = [
  {
    key: 'inicio',
    label: 'INÍCIO',
    icon: Home,
    links: [
      { label: 'Início', href: '/' },
      { label: 'Streams', href: '/streams' },
      { label: 'Ranking', href: '/ranking' },
    ],
  },
  {
    key: 'competitivo',
    label: 'COMPETITIVO',
    icon: Trophy,
    links: [
      { label: 'Torneios', href: '/tournaments' },
    ],
  },
  {
    key: 'clans',
    label: 'CLANS',
    icon: Shield,
    links: [
      { label: 'Ver Clans', href: '/clans' },
    ],
  },
  {
    key: 'loja',
    label: 'LOJA',
    icon: ShoppingBag,
    links: [
      { label: 'Loja', href: '/store' },
    ],
  },
  {
    key: 'jogadores',
    label: 'JOGADORES',
    icon: Users,
    links: [
      { label: 'Ranking', href: '/ranking' },
    ],
  },
];

function HomeSidebar() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState<Record<string, boolean>>({
    inicio: true, competitivo: true, clans: true, loja: true, jogadores: true,
  });

  const toggle = (key: string) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className="hidden lg:flex flex-col w-52 xl:w-56 shrink-0 border-r border-border bg-sidebar min-h-full">
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <Swords className="h-5 w-5 text-sidebar-primary" />
        <span className="font-black text-sidebar-primary tracking-widest uppercase text-sm">GamingHub</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {sidebarSections.map(section => {
          const Icon = section.icon;
          const isExpanded = open[section.key];
          return (
            <div key={section.key}>
              <button
                onClick={() => toggle(section.key)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-sidebar-foreground/60 hover:text-sidebar-foreground tracking-wider uppercase transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {section.label}
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
              </button>
              {isExpanded && (
                <div className="pb-1">
                  {section.links.map(link => {
                    const isActive = link.href === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(link.href);
                    return (
                      <Link key={link.href} to={link.href}>
                        <div className={`flex items-center gap-2 px-6 py-1.5 text-sm transition-colors ${
                          isActive
                            ? 'text-sidebar-primary bg-sidebar-accent'
                            : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                        }`}>
                          {link.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {isAdmin && (
          <div>
            <div className="px-3 py-2 text-xs font-bold text-sidebar-foreground/60 tracking-wider uppercase flex items-center gap-2">
              <Settings className="h-3.5 w-3.5" /> PAINEL ADMIN
            </div>
            <Link to="/admin">
              <div className={`flex items-center gap-2 px-6 py-1.5 text-sm transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'text-sidebar-primary bg-sidebar-accent'
                  : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50'
              }`}>
                Dashboard
              </div>
            </Link>
          </div>
        )}
      </nav>

      {/* Online indicator at bottom */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
          <span className="w-2 h-2 rounded-full bg-primary live-pulse" />
          Online
        </div>
      </div>
    </aside>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user, profile } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [topPlayers, setTopPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [t, s, p] = await Promise.all([
        tournamentsApi.getAll('open', 0, 3),
        streamsApi.getAll('live', 0, 4),
        profilesApi.getRanking(5),
      ]);
      setTournaments(t);
      setStreams(s);
      setTopPlayers(p);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AppLayout sidebar={<HomeSidebar />}>

      {/* Hero */}
      <section className="border-b border-border px-4 md:px-8 py-10 md:py-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, hsl(74 100% 50% / 0.06), transparent)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Swords className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase gradient-text">GamingHub</h1>
          </div>
          <p className="text-base md:text-xl text-muted-foreground mb-2 text-balance">
            A arena definitiva dos gamers
          </p>
          <p className="text-sm text-muted-foreground mb-8 text-pretty">Clans, torneios, streams ao vivo e muito mais</p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register">
                <Button size="lg" className="font-bold tracking-wider w-full sm:w-auto">
                  <Zap className="h-4 w-4 mr-2" /> CRIAR CONTA
                </Button>
              </Link>
              <Link to="/tournaments">
                <Button size="lg" variant="ghost" className="font-bold tracking-wider w-full sm:w-auto border border-border text-muted-foreground hover:border-primary hover:text-primary">
                  <Trophy className="h-4 w-4 mr-2" /> VER TORNEIOS
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Bem-vindo, <span className="text-primary font-bold">{profile?.username}</span>! Pronto para competir?
            </p>
          )}
        </div>
      </section>

      <div className="px-4 md:px-8 py-8 md:py-10 flex flex-col gap-10">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-px bg-border">
          {[
            { icon: Trophy, label: 'Torneios Ativos', value: '3' },
            { icon: Radio, label: 'Streams ao Vivo', value: '—' },
            { icon: Users, label: 'Jogadores', value: '1+' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-card flex flex-col items-center justify-center py-4 gap-1">
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xl md:text-2xl font-black stat-mono text-primary">{value}</span>
              <span className="text-xs text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tournaments */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> Torneios Abertos
              </h2>
              <Link to="/tournaments">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1">
                  Ver todos <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {loading ? Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-20 bg-muted" />
              )) : tournaments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border border-border">Nenhum torneio aberto no momento</p>
              ) : tournaments.map(t => (
                <Link key={t.id} to={`/tournaments/${t.id}`}>
                  <div className="border border-border bg-card hover:border-primary/50 transition-colors p-4 h-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm text-balance leading-tight">{t.name}</h3>
                      <Badge className={`text-xs shrink-0 ${statusColor[t.status]}`}>{statusLabel[t.status]}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t.participant_count}/{t.max_participants}</span>
                      <span className="font-mono">{t.game}</span>
                      {t.prize && <span className="text-primary font-medium">{t.prize}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Streams */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
                <Radio className="h-4 w-4 text-accent" /> Streams ao Vivo
              </h2>
              <Link to="/streams">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1">
                  Ver todas <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {loading ? Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-video bg-muted" />
              )) : streams.length === 0 ? (
                <div className="col-span-2 text-sm text-muted-foreground py-4 text-center border border-border">Nenhuma stream ao vivo no momento</div>
              ) : streams.map(s => (
                <Link key={s.id} to={`/streams/${s.id}`}>
                  <div className="border border-border bg-secondary hover:border-accent/50 transition-colors">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {s.thumbnail_url ? (
                        <img src={s.thumbnail_url} alt={s.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Radio className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground">
                        <span className="live-pulse w-1.5 h-1.5 bg-accent-foreground rounded-full" />
                        AO VIVO
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{s.viewers} espectadores</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Top Players */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" /> Top Jogadores
            </h2>
            <Link to="/ranking">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1">
                Ver ranking <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground font-medium pb-2 whitespace-nowrap pr-4">#</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-2 whitespace-nowrap pr-4">Jogador</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-2 whitespace-nowrap pr-4">Rank</th>
                  <th className="text-right text-xs text-muted-foreground font-medium pb-2 whitespace-nowrap">XP</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={4}><Skeleton className="h-10 bg-muted my-1" /></td></tr>
                )) : topPlayers.map((p, i) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <span className={`font-black stat-mono text-sm ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <Link to={`/profile/${p.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <div className="h-7 w-7 bg-secondary border border-border flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {p.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-medium">{p.username || 'Jogador'}</span>
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      {p.rank ? (
                        <span className="text-sm" style={{ color: p.rank.color }}>{p.rank.icon} {p.rank.name}</span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <span className="text-sm font-bold stat-mono text-primary">{p.xp.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

    </AppLayout>
  );
}
