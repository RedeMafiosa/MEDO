import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { clansApi } from '@/services/api';
import type { Clan } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Shield, Plus, Search, Users, Zap, Loader2 } from 'lucide-react';

export default function ClansPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [newClan, setNewClan] = useState({ name: '', tag: '', description: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await clansApi.getAll(0, 50);
    setClans(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = clans.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tag.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) { toast.error('Faça login para criar um clan'); return; }
    if (profile.clan_id) { toast.error('Você já pertence a um clan'); return; }
    if (!newClan.name.trim() || !newClan.tag.trim()) { toast.error('Nome e tag são obrigatórios'); return; }
    if (newClan.tag.length > 5) { toast.error('Tag deve ter no máximo 5 caracteres'); return; }
    setCreating(true);
    try {
      await clansApi.create({ ...newClan, leader_id: user.id });
      await clansApi.join((await clansApi.getAll(0, 1).then(c => c[0]?.id)) || '', user.id);
      await load();
      await refreshProfile();
      setDialogOpen(false);
      setNewClan({ name: '', tag: '', description: '' });
      toast.success('Clan criado com sucesso!');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erro ao criar clan');
    }
    setCreating(false);
  };

  const handleJoin = async (clanId: string) => {
    if (!user || !profile) { toast.error('Faça login para entrar em um clan'); return; }
    if (profile.clan_id) { toast.error('Saia do seu clan atual primeiro'); return; }
    try {
      await clansApi.join(clanId, user.id);
      await load();
      await refreshProfile();
      toast.success('Você entrou no clan!');
    } catch {
      toast.error('Erro ao entrar no clan');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" /> Clans
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Una-se a um grupo e domine as classificações</p>
          </div>
          {user && !profile?.clan_id && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 font-bold shrink-0">
                  <Plus className="h-4 w-4" /> Criar Clan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Criar Novo Clan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-normal">Nome do Clan</Label>
                    <Input value={newClan.name} onChange={e => setNewClan(p => ({ ...p, name: e.target.value }))} placeholder="ex: Elite Warriors" className="bg-secondary border-border" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-normal">Tag (max 5 chars)</Label>
                    <Input value={newClan.tag} onChange={e => setNewClan(p => ({ ...p, tag: e.target.value.toUpperCase().slice(0, 5) }))} placeholder="ex: ELITE" className="bg-secondary border-border font-mono" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-normal">Descrição</Label>
                    <Input value={newClan.description} onChange={e => setNewClan(p => ({ ...p, description: e.target.value }))} placeholder="Descreva seu clan..." className="bg-secondary border-border" />
                  </div>
                  <Button type="submit" className="font-bold" disabled={creating}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CRIAR CLAN'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clans..." className="pl-9 bg-secondary border-border" />
        </div>

        {/* User clan info */}
        {profile?.clan_id && (
          <div className="border border-primary/30 bg-primary/5 p-3 mb-6 flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-primary shrink-0" />
            <span>Você já pertence a um clan. <Link to={`/clans/${profile.clan_id}`} className="text-primary underline">Ver seu clan</Link></span>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-36 bg-muted" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-border">
            <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum clan encontrado</p>
            <p className="text-sm mt-1">{search ? 'Tente outro termo' : 'Seja o primeiro a criar um clan!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(clan => (
              <div key={clan.id} className="border border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col">
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-secondary border border-border flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">{clan.name}</h3>
                      <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5">[{clan.tag}]</span>
                    </div>
                  </div>
                  {clan.description && <p className="text-xs text-muted-foreground text-pretty line-clamp-2 mb-3">{clan.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{clan.member_count} membros</span>
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" />{clan.total_xp.toLocaleString()} XP</span>
                  </div>
                </div>
                <div className="border-t border-border p-3 flex gap-2">
                  <Link to={`/clans/${clan.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs border border-border text-foreground hover:border-primary hover:text-primary">Ver</Button>
                  </Link>
                  {user && !profile?.clan_id && clan.id !== profile?.clan_id && (
                    <Button size="sm" className="flex-1 text-xs font-bold" onClick={() => handleJoin(clan.id)}>Entrar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
