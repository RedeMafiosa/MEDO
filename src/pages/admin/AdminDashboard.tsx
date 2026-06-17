import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { supabase } from '@/db/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Trophy, Shield, Radio, ShoppingBag, BarChart3, Medal } from 'lucide-react';

interface Stats {
  users: number;
  clans: number;
  tournaments: number;
  streams: number;
  store_items: number;
  ranks: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [
        { count: users },
        { count: clans },
        { count: tournaments },
        { count: streams },
        { count: store_items },
        { count: ranks },
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('clans').select('id', { count: 'exact', head: true }),
        supabase.from('tournaments').select('id', { count: 'exact', head: true }),
        supabase.from('streams').select('id', { count: 'exact', head: true }),
        supabase.from('store_items').select('id', { count: 'exact', head: true }),
        supabase.from('ranks').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        users: users || 0,
        clans: clans || 0,
        tournaments: tournaments || 0,
        streams: streams || 0,
        store_items: store_items || 0,
        ranks: ranks || 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: 'Usuários', key: 'users', icon: Users, color: 'text-chart-3' },
    { label: 'Clans', key: 'clans', icon: Shield, color: 'text-chart-4' },
    { label: 'Torneios', key: 'tournaments', icon: Trophy, color: 'text-primary' },
    { label: 'Streams', key: 'streams', icon: Radio, color: 'text-accent' },
    { label: 'Itens Loja', key: 'store_items', icon: ShoppingBag, color: 'text-chart-5' },
    { label: 'Ranks', key: 'ranks', icon: Medal, color: 'text-chart-2' },
  ] as const;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da plataforma</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, key, icon: Icon, color }) => (
          <div key={key} className="border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16 bg-muted" />
            ) : (
              <p className={`text-3xl font-black stat-mono ${color}`}>{stats?.[key] ?? 0}</p>
            )}
          </div>
        ))}
      </div>

      <div className="border border-border bg-card p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Gerenciar Usuários', href: '/admin/users', icon: Users },
            { label: 'Gerenciar Ranks', href: '/admin/ranks', icon: Medal },
            { label: 'Torneios', href: '/admin/tournaments', icon: Trophy },
            { label: 'Configurações', href: '/admin/settings', icon: BarChart3 },
          ].map(({ label, href, icon: Icon }) => (
            <a key={href} href={href} className="border border-border bg-secondary hover:border-primary/50 hover:bg-primary/5 transition-colors p-4 flex flex-col items-center gap-2 text-center">
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
