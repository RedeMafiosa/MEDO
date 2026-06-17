import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ranksApi } from '@/services/api';
import type { Rank } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Medal, Plus, Edit2, Trash2, Loader2, Tag } from 'lucide-react';
import { MemberTag } from '@/components/ui/member-tag';

const EMPTY: Omit<Rank, 'id' | 'created_at'> = { name: '', icon: '⭐', color: '#CCFF00', min_xp: 0, sort_order: 0 };

export default function AdminRanks() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ open: boolean; rank: Rank | null }>({ open: false, rank: null });
  const [form, setForm] = useState<Omit<Rank, 'id' | 'created_at'>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setRanks(await ranksApi.getAll());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setDialog({ open: true, rank: null }); };
  const openEdit = (r: Rank) => {
    setForm({ name: r.name, icon: r.icon, color: r.color, min_xp: r.min_xp, sort_order: r.sort_order });
    setDialog({ open: true, rank: r });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nome obrigatório'); return; }
    setSaving(true);
    try {
      if (dialog.rank) {
        await ranksApi.update(dialog.rank.id, form);
        toast.success('Rank atualizado');
      } else {
        await ranksApi.create(form);
        toast.success('Rank criado');
      }
      setDialog({ open: false, rank: null });
      await load();
    } catch { toast.error('Erro ao salvar rank'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await ranksApi.delete(id);
    toast.success('Rank removido');
    await load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
          <Medal className="h-5 w-5 text-primary" /> Ranks
        </h1>
        <Button onClick={openCreate} className="gap-2 font-bold text-sm h-9">
          <Plus className="h-4 w-4" /> Novo Rank
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-16 bg-muted" />)}
        </div>
      ) : (
        <div className="border border-border bg-card overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {['Ordem', 'Ícone', 'Nome', 'Cor', 'XP Mínimo', 'Ações'].map(h => (
                  <th key={h} className="text-left text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranks.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-sm stat-mono text-muted-foreground">{r.sort_order}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-xl">{r.icon}</td>
                  <td className="py-3 px-4 whitespace-nowrap font-bold text-sm" style={{ color: r.color }}>{r.name}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border border-border" style={{ backgroundColor: r.color }} />
                      <span className="text-xs font-mono text-muted-foreground">{r.color}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm stat-mono text-primary">{r.min_xp.toLocaleString()}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 border border-border hover:border-primary hover:text-primary" onClick={() => openEdit(r)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 border border-border hover:border-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Rank?</AlertDialogTitle>
                            <AlertDialogDescription>O rank "{r.name}" será removido permanentemente.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(r.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tags de Administração ─────────────────────────────────────────── */}
      <div className="mt-10">
        <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 mb-5">
          <Tag className="h-5 w-5 text-primary" /> Tags de Membros
        </h2>

        {/* Staff tags */}
        <div className="border border-border bg-card p-5 mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4">Equipe / Administração</p>
          <div className="flex flex-wrap gap-4">
            {[
              { variant: 'fundador' as const, label: 'Fundador',   desc: 'Criador da plataforma' },
              { variant: 'dono'     as const, label: 'Dono',        desc: 'Proprietário' },
              { variant: 'admin'    as const, label: 'Admin',       desc: 'Administrador' },
              { variant: 'moderador' as const, label: 'Moderador', desc: 'Moderador de conteúdo' },
            ].map(({ variant, label, desc }) => (
              <div key={variant} className="flex flex-col items-start gap-1.5">
                <MemberTag variant={variant} label={label} />
                <span className="text-xs text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Special tags */}
        <div className="border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4">Tags Especiais</p>
          <div className="flex flex-wrap gap-4">
            {[
              { variant: 'vip'      as const, label: 'VIP',        desc: 'Membro VIP' },
              { variant: 'booster'  as const, label: 'Booster',    desc: 'Impulsionou o servidor' },
              { variant: 'og'       as const, label: 'Membro OG',  desc: 'Membro original' },
              { variant: 'streamer' as const, label: 'Streamer',   desc: 'Transmite ao vivo' },
            ].map(({ variant, label, desc }) => (
              <div key={variant} className="flex flex-col items-start gap-1.5">
                <MemberTag variant={variant} label={label} />
                <span className="text-xs text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={dialog.open} onOpenChange={open => !open && setDialog({ open: false, rank: null })}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border">
          <DialogHeader><DialogTitle>{dialog.rank ? 'Editar Rank' : 'Novo Rank'}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">Nome</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="ex: Ouro" className="bg-secondary border-border" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">Ícone (emoji)</Label>
                <Input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="⭐" className="bg-secondary border-border text-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">Cor (hex)</Label>
                <div className="flex gap-2">
                  <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-9 w-12 border border-border bg-secondary cursor-pointer p-1" />
                  <Input value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="flex-1 bg-secondary border-border font-mono text-sm" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">Ordem de Exibição</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="bg-secondary border-border" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">XP Mínimo</Label>
              <Input type="number" value={form.min_xp} onChange={e => setForm(p => ({ ...p, min_xp: parseInt(e.target.value) || 0 }))} className="bg-secondary border-border" />
            </div>
            {/* Preview */}
            <div className="border border-border bg-secondary p-3 flex items-center gap-3">
              <span className="text-2xl">{form.icon}</span>
              <div>
                <p className="font-bold" style={{ color: form.color }}>{form.name || 'Prévia do Rank'}</p>
                <p className="text-xs text-muted-foreground stat-mono">{form.min_xp.toLocaleString()} XP</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="font-bold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SALVAR'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
