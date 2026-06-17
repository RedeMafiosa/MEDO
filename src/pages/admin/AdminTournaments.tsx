import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { tournamentsApi } from '@/services/api';
import type { Tournament } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Trophy, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

const EMPTY: Omit<Tournament, 'id' | 'created_at' | 'participant_count'> = {
  name: '', description: '', game: '', status: 'open',
  max_participants: 16, start_date: '', prize: '', rules: '', banner_url: '', created_by: null,
};

const statusColor: Record<string, string> = {
  open: 'bg-primary text-primary-foreground',
  ongoing: 'bg-accent text-accent-foreground',
  finished: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};
const statusLabel: Record<string, string> = {
  open: 'Aberto', ongoing: 'Em Andamento', finished: 'Finalizado', cancelled: 'Cancelado',
};

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ open: boolean; t: Tournament | null }>({ open: false, t: null });
  const [form, setForm] = useState<Omit<Tournament, 'id' | 'created_at' | 'participant_count'>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setTournaments(await tournamentsApi.getAll('all', 0, 100));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setDialog({ open: true, t: null }); };
  const openEdit = (t: Tournament) => {
    setForm({ name: t.name, description: t.description || '', game: t.game, status: t.status, max_participants: t.max_participants, start_date: t.start_date || '', prize: t.prize || '', rules: t.rules || '', banner_url: t.banner_url || '', created_by: t.created_by });
    setDialog({ open: true, t });
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.game.trim()) { toast.error('Nome e jogo são obrigatórios'); return; }
    setSaving(true);
    try {
      if (dialog.t) {
        await tournamentsApi.update(dialog.t.id, form);
        toast.success('Torneio atualizado');
      } else {
        await tournamentsApi.create(form);
        toast.success('Torneio criado');
      }
      setDialog({ open: false, t: null });
      await load();
    } catch { toast.error('Erro ao salvar torneio'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await tournamentsApi.delete(id);
    toast.success('Torneio removido');
    await load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" /> Torneios
        </h1>
        <Button onClick={openCreate} className="gap-2 font-bold text-sm h-9">
          <Plus className="h-4 w-4" /> Novo Torneio
        </Button>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-border bg-secondary">
              {['Nome', 'Jogo', 'Status', 'Participantes', 'Prêmio', 'Ações'].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(4).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-4 py-2"><Skeleton className="h-8 bg-muted" /></td></tr>
            )) : tournaments.map(t => (
              <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">{t.name}</td>
                <td className="py-3 px-4 whitespace-nowrap text-sm font-mono text-muted-foreground">{t.game}</td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Badge className={`text-xs ${statusColor[t.status]}`}>{statusLabel[t.status]}</Badge>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm stat-mono text-primary">{t.participant_count}/{t.max_participants}</td>
                <td className="py-3 px-4 whitespace-nowrap text-sm text-muted-foreground">{t.prize || '—'}</td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 border border-border hover:border-primary hover:text-primary" onClick={() => openEdit(t)}>
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
                          <AlertDialogTitle>Remover Torneio?</AlertDialogTitle>
                          <AlertDialogDescription>"{t.name}" será removido permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
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

      <Dialog open={dialog.open} onOpenChange={open => !open && setDialog({ open: false, t: null })}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border overflow-y-auto max-h-[90dvh]">
          <DialogHeader><DialogTitle>{dialog.t ? 'Editar Torneio' : 'Novo Torneio'}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            {[
              { label: 'Nome', key: 'name', placeholder: 'Nome do torneio' },
              { label: 'Jogo', key: 'game', placeholder: 'ex: Fortnite, CSGO...' },
              { label: 'Prêmio', key: 'prize', placeholder: 'ex: R$ 500, Item Raro...' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">{label}</Label>
                <Input value={(form as unknown as Record<string, string>)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="bg-secondary border-border" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">Max Participantes</Label>
                <Input type="number" value={form.max_participants} onChange={e => setForm(p => ({ ...p, max_participants: parseInt(e.target.value) || 16 }))} className="bg-secondary border-border" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as Tournament['status'] }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="ongoing">Em Andamento</SelectItem>
                    <SelectItem value="finished">Finalizado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Data de Início</Label>
              <Input type="datetime-local" value={form.start_date || ''} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Descrição</Label>
              <Input value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição..." className="bg-secondary border-border" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Regras</Label>
              <Input value={form.rules || ''} onChange={e => setForm(p => ({ ...p, rules: e.target.value }))} placeholder="Regras do torneio..." className="bg-secondary border-border" />
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
