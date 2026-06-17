const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, ShoppingBag, Upload, Image, X } from "lucide-react";
import { toast } from "sonner";

const defaultItem = {
  name: "", description: "", category: "tokens", price_eur: 0, price_tokens: 0,
  amount: 0, bonus_amount: 0, image_url: "", is_popular: false, is_active: true, discount_percent: 0
};

export default function AdminStore() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultItem);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: items = [] } = useQuery({
    queryKey: ["admin-store-items"],
    queryFn: () => db.entities.StoreItem.list("-created_date", 50),
  });

  const createMut = useMutation({
    mutationFn: (data) => db.entities.StoreItem.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-store-items"] }); setDialogOpen(false); toast.success("Produto criado!"); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => db.entities.StoreItem.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-store-items"] }); setDialogOpen(false); toast.success("Produto atualizado!"); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => db.entities.StoreItem.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-store-items"] }); toast.success("Produto eliminado!"); },
  });

  const openCreate = () => { setEditItem(null); setForm(defaultItem); setDialogOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...defaultItem, ...item }); setDialogOpen(true); };
  const handleSave = () => {
    if (editItem) updateMut.mutate({ id: editItem.id, data: form });
    else createMut.mutate(form);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await db.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: res.file_url }));
    setUploading(false);
    toast.success("Imagem carregada!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" /> Gerir Loja
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" />Novo Produto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editItem ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Descrição</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["tokens","diamonds","gems","vip","emotes","badges","themes"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Imagem / GIF</Label>
                <div className="flex items-center gap-3">
                  {form.image_url && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                      <img src={form.image_url} alt="" className="w-full h-full object-contain" />
                      <button onClick={() => setForm(f => ({...f, image_url: ""}))} className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-white text-[10px]">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      <Upload className="w-4 h-4" />
                      {uploading ? "A carregar..." : "Upload Imagem / GIF"}
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*,.gif" className="hidden" onChange={handleFileUpload} />
                    <Input
                      value={form.image_url}
                      onChange={e => setForm({...form, image_url: e.target.value})}
                      placeholder="ou cole um URL de imagem/GIF"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Preço (€)</Label><Input type="number" step="0.01" value={form.price_eur} onChange={e => setForm({...form, price_eur: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Preço (Tokens)</Label><Input type="number" value={form.price_tokens} onChange={e => setForm({...form, price_tokens: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Quantidade</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Bónus</Label><Input type="number" value={form.bonus_amount} onChange={e => setForm({...form, bonus_amount: Number(e.target.value)})} /></div>
              </div>
              <div className="space-y-2"><Label>Desconto (%)</Label><Input type="number" value={form.discount_percent} onChange={e => setForm({...form, discount_percent: Number(e.target.value)})} /></div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.is_popular} onCheckedChange={v => setForm({...form, is_popular: v})} /><Label>Popular</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} /><Label>Ativo</Label></div>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={createMut.isPending || updateMut.isPending}>
                {editItem ? "Guardar" : "Criar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                      {item.image_url
                        ? <img src={item.image_url} alt="" className="w-full h-full object-contain" />
                        : <Image className="w-4 h-4 text-muted-foreground" />
                      }
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{item.category}</Badge></TableCell>
                  <TableCell>€{item.price_eur?.toFixed(2)}</TableCell>
                  <TableCell>{item.amount || 0}{item.bonus_amount > 0 && <span className="text-green-400 text-xs ml-1">+{item.bonus_amount}</span>}</TableCell>
                  <TableCell>
                    <Badge className={item.is_active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-secondary text-muted-foreground"}>
                      {item.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMut.mutate(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}