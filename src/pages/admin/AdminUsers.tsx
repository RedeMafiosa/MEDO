import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { profilesApi, ranksApi } from '@/services/api';
import type { Profile, Rank } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Users, Search, Edit2, Ban, ShieldCheck, Medal, Loader2 } from 'lucide-react';

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Profile | null>(null);
  const [editData, setEditData] = useState<{ rank_id: string; role: string; coins: string; xp: string }>({ rank_id: '', role: 'user', coins: '0', xp: '0' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([profilesApi.getAll(0, 200), ranksApi.getAll()]);
    setProfiles(p);
    setRanks(r);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = profiles.filter(p =>
    (p.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (p: Profile) => {
    setEditing(p);
    setEditData({ rank_id: p.rank_id || 'none', role: p.role, coins: String(p.coins), xp: String(p.xp) });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await profilesApi.adminUpdate(editing.id, {
        rank_id: editData.rank_id === 'none' ? null : editData.rank_id,
        role: editData.role as 'user' | 'admin',
        coins: parseInt(editData.coins) || 0,
        xp: parseInt(editData.xp) || 0,
      });
      toast.success('Usuário atualizado');
      setEditing(null);
      await load();
    } catch { toast.error('Erro ao atualizar'); }
    setSaving(false);
  };

  const toggleBan = async (p: Profile) => {
    await profilesApi.adminUpdate(p.id, { is_banned: !p.is_banned });
    toast.success(p.is_banned ? 'Usuário desbanido' : 'Usuário banido');
    await load();
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Usuários
        </h1>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por usuário ou email..." className="pl-9 bg-secondary border-border" />
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-border bg-secondary">
              {['Usuário', 'Email', 'Rank', 'XP', 'Moedas', 'Role', 'Status', 'Ações'].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-2"><Skeleton className="h-8 bg-muted" /></td></tr>
              ))
            ) : filtered.map(p => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-2.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-secondary border border-border flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {p.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium">{p.username || '—'}</span>
                  </div>
                </td>
                <td className="py-2.5 px-4 whitespace-nowrap text-sm text-muted-foreground">{p.email || '—'}</td>
                <td className="py-2.5 px-4 whitespace-nowrap">
                  {p.rank ? (
                    <span className="text-sm" style={{ color: p.rank.color }}>{p.rank.icon} {p.rank.name}</span>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="py-2.5 px-4 whitespace-nowrap text-sm stat-mono text-primary">{p.xp.toLocaleString()}</td>
                <td className="py-2.5 px-4 whitespace-nowrap text-sm stat-mono text-muted-foreground">{p.coins.toLocaleString()}</td>
                <td className="py-2.5 px-4 whitespace-nowrap">
                  <Badge className={p.role === 'admin' ? 'bg-primary text-primary-foreground text-xs' : 'bg-secondary text-muted-foreground text-xs border border-border'}>{p.role}</Badge>
                </td>
                <td className="py-2.5 px-4 whitespace-nowrap">
                  <Badge className={p.is_banned ? 'bg-destructive text-destructive-foreground text-xs' : 'bg-muted text-muted-foreground text-xs'}>
                    {p.is_banned ? 'Banido' : 'Ativo'}
                  </Badge>
                </td>
                <td className="py-2.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 border border-border hover:border-primary hover:text-primary" onClick={() => openEdit(p)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 border border-border ${p.is_banned ? 'hover:border-primary hover:text-primary' : 'hover:border-destructive hover:text-destructive'}`} onClick={() => toggleBan(p)}>
                      {p.is_banned ? <ShieldCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border">
          <DialogHeader><DialogTitle>Editar Usuário: {editing?.username}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Rank</Label>
              <Select value={editData.rank_id} onValueChange={v => setEditData(p => ({ ...p, rank_id: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecionar rank" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem Rank</SelectItem>
                  {ranks.map(r => <SelectItem key={r.id} value={r.id}>{r.icon} {r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Role</Label>
              <Select value={editData.role} onValueChange={v => setEditData(p => ({ ...p, role: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">XP</Label>
                <Input type="number" value={editData.xp} onChange={e => setEditData(p => ({ ...p, xp: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">Moedas</Label>
                <Input type="number" value={editData.coins} onChange={e => setEditData(p => ({ ...p, coins: e.target.value }))} className="bg-secondary border-border" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="font-bold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SALVAR ALTERAÇÕES'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
