const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

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
import { Plus, Edit, Trash2, Crown } from "lucide-react";
import { toast } from "sonner";

const defaultPlan = {
  name: "", tier: "bronze", price_monthly: 0, price_yearly: 0,
  features: [], badge_color: "#8B5CF6", max_emotes: 5,
  ad_free: false, priority_support: false, exclusive_chat: false, is_active: true
};

export default function AdminVip() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState(defaultPlan);
  const [featuresText, setFeaturesText] = useState("");

  const { data: plans = [] } = useQuery({
    queryKey: ["admin-vip-plans"],
    queryFn: () => db.entities.VipPlan.list("price_monthly", 10),
  });

  const createMut = useMutation({
    mutationFn: (data) => db.entities.VipPlan.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-vip-plans"] }); setDialogOpen(false); toast.success("Plano criado!"); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => db.entities.VipPlan.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-vip-plans"] }); setDialogOpen(false); toast.success("Plano atualizado!"); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => db.entities.VipPlan.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-vip-plans"] }); toast.success("Plano eliminado!"); },
  });

  const openCreate = () => { setEditPlan(null); setForm(defaultPlan); setFeaturesText(""); setDialogOpen(true); };
  const openEdit = (p) => { setEditPlan(p); setForm({ ...defaultPlan, ...p }); setFeaturesText((p.features || []).join("\n")); setDialogOpen(true); };
  const handleSave = () => {
    const data = { ...form, features: featuresText.split("\n").filter(f => f.trim()) };
    if (editPlan) updateMut.mutate({ id: editPlan.id, data });
    else createMut.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-400" /> Gerir VIP
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" />Novo Plano</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editPlan ? "Editar Plano" : "Novo Plano"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={form.tier} onValueChange={v => setForm({...form, tier: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["bronze","silver","gold","platinum","diamond"].map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Preço Mensal (€)</Label><Input type="number" step="0.01" value={form.price_monthly} onChange={e => setForm({...form, price_monthly: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Preço Anual (€)</Label><Input type="number" step="0.01" value={form.price_yearly} onChange={e => setForm({...form, price_yearly: Number(e.target.value)})} /></div>
              </div>
              <div className="space-y-2">
                <Label>Funcionalidades (uma por linha)</Label>
                <textarea value={featuresText} onChange={e => setFeaturesText(e.target.value)} className="w-full h-24 bg-secondary rounded-lg p-3 text-sm border-none resize-none" placeholder="Badge exclusivo&#10;Emotes especiais&#10;Chat VIP" />
              </div>
              <div className="space-y-2"><Label>Máx. Emotes</Label><Input type="number" value={form.max_emotes} onChange={e => setForm({...form, max_emotes: Number(e.target.value)})} /></div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2"><Switch checked={form.ad_free} onCheckedChange={v => setForm({...form, ad_free: v})} /><Label>Sem Anúncios</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.priority_support} onCheckedChange={v => setForm({...form, priority_support: v})} /><Label>Suporte Prioritário</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.exclusive_chat} onCheckedChange={v => setForm({...form, exclusive_chat: v})} /><Label>Chat Exclusivo</Label></div>
              </div>
              <Button onClick={handleSave} className="w-full">{editPlan ? "Guardar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Mensal</TableHead>
                <TableHead>Anual</TableHead>
                <TableHead>Funcionalidades</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px] capitalize">{p.tier}</Badge></TableCell>
                  <TableCell>€{p.price_monthly?.toFixed(2)}</TableCell>
                  <TableCell>€{p.price_yearly?.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{(p.features || []).length} itens</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMut.mutate(p.id)}><Trash2 className="w-4 h-4" /></Button>
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