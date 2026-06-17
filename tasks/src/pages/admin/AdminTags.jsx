const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import TagBadge from "@/components/tags/TagBadge";

const EFFECTS = ["none", "stars", "bubbles", "sparkle", "rainbow", "fire"];
const PRESET_COLORS = ["#ff4444", "#ff8c00", "#ffd700", "#00ff88", "#00bfff", "#8b5cf6", "#ff69b4", "#00ffff", "#ff6b6b", "#a855f7"];

const defaultForm = { name: "", label: "", color: "#8b5cf6", bg_color: "#1e1b2e", effect: "none", icon: "🏷️", priority: 0, is_active: true };

export default function AdminTags() {
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const { data: tags = [] } = useQuery({
    queryKey: ["member-tags"],
    queryFn: () => db.entities.MemberTag.list("-priority", 50),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? db.entities.MemberTag.update(editing.id, data)
      : db.entities.MemberTag.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["member-tags"] });
      setShowDialog(false);
      setEditing(null);
      setForm(defaultForm);
      toast.success(editing ? "Tag atualizada!" : "Tag criada!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.MemberTag.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["member-tags"] }); toast.success("Tag eliminada!"); },
  });

  const openEdit = (tag) => {
    setEditing(tag);
    setForm({ ...defaultForm, ...tag });
    setShowDialog(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Tag className="w-6 h-6 text-primary" /> Tags de Membros
        </h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Nova Tag</Button>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map(tag => (
          <div key={tag.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <TagBadge tag={tag} />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(tag)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(tag.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>ID: <span className="font-mono text-foreground">{tag.name}</span></p>
              <p>Efeito: <span className="text-foreground capitalize">{tag.effect}</span></p>
              <p>Prioridade: <span className="text-foreground">{tag.priority}</span></p>
              <p>Estado: <span className={tag.is_active ? "text-green-400" : "text-red-400"}>{tag.is_active ? "Ativa" : "Inativa"}</span></p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={() => { setShowDialog(false); setEditing(null); }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Editar Tag" : "Nova Tag"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome (ID único)</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="ex: founder" />
              </div>
              <div className="space-y-1.5">
                <Label>Label (exibido)</Label>
                <Input value={form.label} onChange={e => setForm({...form, label: e.target.value})} placeholder="ex: Fundador" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ícone (emoji)</Label>
                <Input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="🏷️" />
              </div>
              <div className="space-y-1.5">
                <Label>Prioridade</Label>
                <Input type="number" value={form.priority} onChange={e => setForm({...form, priority: Number(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor do texto</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => setForm({...form, color: c})}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? "border-white scale-125" : "border-transparent"}`}
                    style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-6 h-6 rounded-full cursor-pointer border-0" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Efeito de hover</Label>
              <Select value={form.effect} onValueChange={v => setForm({...form, effect: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EFFECTS.map(e => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Preview */}
            <div className="bg-secondary rounded-lg p-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Preview:</span>
              <span className="text-sm font-semibold">unzag</span>
              <TagBadge tag={form} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} />
              <Label>Tag Ativa</Label>
            </div>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || !form.label || saveMutation.isPending} className="w-full">
              {editing ? "Guardar Alterações" : "Criar Tag"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}