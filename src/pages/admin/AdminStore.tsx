import { useEffect, useRef, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { storeApi } from '@/services/api';
import type { StoreItem } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, Plus, Edit2, Trash2, Loader2, Package, Upload, X } from 'lucide-react';

const EMPTY: Omit<StoreItem, 'id' | 'created_at'> = {
  name: '', description: '', price: 100, image_url: '', category: 'cosmetic', is_active: true,
};

export default function AdminStore() {
  const { user } = useAuth();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ open: boolean; item: StoreItem | null }>({ open: false, item: null });
  const [form, setForm] = useState<Omit<StoreItem, 'id' | 'created_at'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();

  const load = async () => {
    setLoading(true);
    setItems(await storeApi.getAllItems());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setPreviewUrl('');
    setDialog({ open: true, item: null });
  };
  const openEdit = (item: StoreItem) => {
    setForm({ name: item.name, description: item.description || '', price: item.price, image_url: item.image_url || '', category: item.category, is_active: item.is_active });
    setPreviewUrl(item.image_url || '');
    setDialog({ open: true, item });
  };

  const handleFileSelect = async (file: File) => {
    if (!user) return;
    const url = await uploadImage(file, 'store-images', user.id, form.name || 'item');
    if (url) {
      setForm(p => ({ ...p, image_url: url }));
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nome obrigatório'); return; }
    setSaving(true);
    try {
      if (dialog.item) {
        await storeApi.updateItem(dialog.item.id, form);
        toast.success('Item atualizado');
      } else {
        await storeApi.createItem(form);
        toast.success('Item criado');
      }
      setDialog({ open: false, item: null });
      await load();
    } catch { toast.error('Erro ao salvar item'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await storeApi.deleteItem(id);
    toast.success('Item removido');
    await load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" /> Loja
        </h1>
        <Button onClick={openCreate} className="gap-2 font-bold text-sm h-9">
          <Plus className="h-4 w-4" /> Novo Item
        </Button>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-border bg-secondary">
              {['Item', 'Categoria', 'Preço', 'Status', 'Ações'].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-4 py-2"><Skeleton className="h-8 bg-muted" /></td></tr>
            )) : items.map(item => (
              <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-8 w-8 object-cover border border-border" />
                    ) : <Package className="h-6 w-6 text-muted-foreground" />}
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Badge className="text-xs bg-secondary text-muted-foreground border border-border capitalize">{item.category}</Badge>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm font-black stat-mono text-primary">{item.price} 🪙</td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Badge className={item.is_active ? 'bg-primary/20 text-primary text-xs border border-primary/30' : 'bg-muted text-muted-foreground text-xs'}>
                    {item.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 border border-border hover:border-primary hover:text-primary" onClick={() => openEdit(item)}>
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
                          <AlertDialogTitle>Remover Item?</AlertDialogTitle>
                          <AlertDialogDescription>"{item.name}" será removido da loja.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
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

      <Dialog open={dialog.open} onOpenChange={open => !open && setDialog({ open: false, item: null })}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border overflow-y-auto max-h-[90dvh]">
          <DialogHeader><DialogTitle>{dialog.item ? 'Editar Item' : 'Novo Item'}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 mt-2">

            {/* Image upload area */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Imagem do Item</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }}
              />
              {previewUrl ? (
                <div className="relative border border-border bg-secondary">
                  <img src={previewUrl} alt="Preview" className="w-full h-40 object-contain" />
                  <button
                    type="button"
                    onClick={() => { setPreviewUrl(''); setForm(p => ({ ...p, image_url: '' })); }}
                    className="absolute top-2 right-2 bg-background/80 border border-border p-1 hover:border-destructive hover:text-destructive transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-secondary h-32 hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Clique para enviar</span>
                      <span className="text-xs">JPG, PNG, GIF, WebP • Máx. 10MB</span>
                    </>
                  )}
                </button>
              )}
              {/* Also allow manual URL */}
              <Input
                value={form.image_url || ''}
                onChange={e => { setForm(p => ({ ...p, image_url: e.target.value })); setPreviewUrl(e.target.value); }}
                placeholder="Ou cole uma URL de imagem"
                className="bg-secondary border-border text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Nome</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome do item" className="bg-secondary border-border" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Descrição</Label>
              <Input value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição do item" className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">Preço (moedas)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: parseInt(e.target.value) || 0 }))} className="bg-secondary border-border" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal">Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['avatar', 'banner', 'cosmetic', 'booster', 'title', 'coins'].map(c => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4" />
              <Label htmlFor="is_active" className="text-sm font-normal cursor-pointer">Item ativo na loja</Label>
            </div>
            <Button onClick={handleSave} disabled={saving || uploading} className="font-bold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SALVAR'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
