import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { tagsApi } from '@/services/api';
import type { MemberTagRecord } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Tag, Plus, Edit2, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { MemberTag, type TagVariant } from '@/components/ui/member-tag';

const VARIANTS: { value: TagVariant; label: string }[] = [
  { value: 'fundador',  label: 'Fundador (RGB arco-íris)' },
  { value: 'dono',      label: 'Dono (Neon vermelho)' },
  { value: 'admin',     label: 'Admin (Dourado)' },
  { value: 'moderador', label: 'Moderador (Ciano neon)' },
  { value: 'vip',       label: 'VIP (Roxo glow)' },
  { value: 'booster',   label: 'Booster (Rosa neon)' },
  { value: 'og',        label: 'OG (Laranja fogo)' },
  { value: 'streamer',  label: 'Streamer (Verde neon)' },
  { value: 'default',   label: 'Padrão (cinza)' },
];

type TagForm = Omit<MemberTagRecord, 'id' | 'created_at'>;

const EMPTY: TagForm = {
  name: '',
  variant: 'default',
  icon: '🏷️',
  description: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminTags() {
  const [tags, setTags] = useState<MemberTagRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ open: boolean; tag: MemberTagRecord | null }>({ open: false, tag: null });
  const [form, setForm] = useState<TagForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setTags(await tagsApi.getAll());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setDialog({ open: true, tag: null }); };
  const openEdit = (t: MemberTagRecord) => {
    setForm({
      name: t.name,
      variant: t.variant,
      icon: t.icon,
      description: t.description ?? '',
      sort_order: t.sort_order,
      is_active: t.is_active,
    });
    setDialog({ open: true, tag: t });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nome obrigatório'); return; }
    setSaving(true);
    try {
      if (dialog.tag) {
        await tagsApi.update(dialog.tag.id, { ...form, description: form.description || null });
        toast.success('Tag atualizada');
      } else {
        await tagsApi.create({ ...form, description: form.description || null });
        toast.success('Tag criada');
      }
      setDialog({ open: false, tag: null });
      await load();
    } catch { toast.error('Erro ao salvar tag'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await tagsApi.delete(id);
    toast.success('Tag removida');
    await load();
  };

  const toggleActive = async (t: MemberTagRecord) => {
    await tagsApi.update(t.id, { is_active: !t.is_active });
    toast.success(t.is_active ? 'Tag desativada' : 'Tag ativada');
    await load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" /> Tags de Membros
        </h1>
        <Button onClick={openCreate} className="gap-2 font-bold text-sm h-9">
          <Plus className="h-4 w-4" /> Nova Tag
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-16 bg-muted" />)}
        </div>
      ) : (
        <div className="border border-border bg-card overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {['Ordem', 'Ícone', 'Nome', 'Prévia', 'Variante', 'Descrição', 'Status', 'Ações'].map(h => (
                  <th key={h} className="text-left text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tags.map(t => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-sm stat-mono text-muted-foreground">{t.sort_order}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-xl">{t.icon}</td>
                  <td className="py-3 px-4 whitespace-nowrap font-bold text-sm text-foreground">{t.name}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <MemberTag variant={t.variant as TagVariant} label={t.name} size="sm" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-xs font-mono text-muted-foreground">{t.variant}</span>
                  </td>
                  <td className="py-3 px-4 max-w-[180px]">
                    <span className="text-xs text-muted-foreground line-clamp-1">{t.description || '—'}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(t)}
                      className={`h-7 px-2 gap-1 text-xs border ${t.is_active ? 'border-primary/40 text-primary hover:bg-primary/10' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
                    >
                      {t.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {t.is_active ? 'Ativa' : 'Inativa'}
                    </Button>
                  </td>
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
                            <AlertDialogTitle>Remover Tag?</AlertDialogTitle>
                            <AlertDialogDescription>A tag "{t.name}" será removida permanentemente.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialog.open} onOpenChange={open => !open && setDialog({ open: false, tag: null })}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border">
          <DialogHeader><DialogTitle>{dialog.tag ? 'Editar Tag' : 'Nova Tag'}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">Nome</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="ex: VIP" className="bg-secondary border-border" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">Ícone (emoji)</Label>
                <Input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="🏷️" className="bg-secondary border-border text-xl" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Variante (estilo visual)</Label>
              <Select value={form.variant} onValueChange={v => setForm(p => ({ ...p, variant: v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Escolha a variante" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {VARIANTS.map(v => (
                    <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Descrição</Label>
              <Textarea
                value={form.description ?? ''}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="bg-secondary border-border text-sm resize-none"
                rows={2}
                placeholder="Sobre esta tag..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Ordem de Exibição</Label>
              <Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="bg-secondary border-border" />
            </div>

            {/* Prévia */}
            <div className="border border-border bg-secondary p-4 flex items-center gap-4">
              <span className="text-2xl">{form.icon}</span>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Prévia</p>
                <MemberTag variant={form.variant as TagVariant} label={form.name || 'Prévia'} />
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
