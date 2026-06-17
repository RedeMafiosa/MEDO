const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Hash, Users, Lock } from "lucide-react";
import { toast } from "sonner";

export default function AdminRooms() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", icon: "🎮", max_members: 50,
    is_private: false, password: "", category: "gaming"
  });

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: () => db.entities.Room.list("-created_date", 100),
  });

  const createRoom = useMutation({
    mutationFn: () => db.entities.Room.create({
      ...form,
      owner_id: user?.id || "admin",
      owner_name: "Admin",
      members_count: 0,
      is_active: true,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rooms"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      setShowCreate(false);
      setForm({ name: "", description: "", icon: "🎮", max_members: 50, is_private: false, password: "", category: "gaming" });
      toast.success("Sala criada!");
    }
  });

  const toggleRoom = useMutation({
    mutationFn: ({ id, is_active }) => db.entities.Room.update(id, { is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rooms"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
    }
  });

  const deleteRoom = useMutation({
    mutationFn: (id) => db.entities.Room.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rooms"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Sala eliminada permanentemente!");
    }
  });

  const activeRooms = rooms.filter(r => r.is_active);
  const inactiveRooms = rooms.filter(r => !r.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestão de Salas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeRooms.length} ativas · {inactiveRooms.length} inativas
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Criar Sala
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {rooms.map(room => (
            <Card key={room.id} className={`border-border ${!room.is_active ? "opacity-50" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                  {room.icon || "🎮"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{room.name}</p>
                    {room.is_private && <Lock className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                    <Badge className={room.is_active ? "bg-green-600/20 text-green-400 border-none text-xs" : "bg-secondary text-muted-foreground border-none text-xs"}>
                      {room.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    por {room.owner_name} · <Users className="w-3 h-3 inline" /> {room.members_count || 0}/{room.max_members} · {room.category}
                  </p>
                  {room.description && <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{room.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2"
                    onClick={() => toggleRoom.mutate({ id: room.id, is_active: !room.is_active })}>
                    {room.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => { if (confirm(`Eliminar "${room.name}"?`)) deleteRoom.mutate(room.id); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {rooms.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Hash className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhuma sala criada ainda.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Room Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Criar Sala (Admin)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Gaming PT" />
              </div>
              <div className="space-y-1.5">
                <Label>Ícone</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🎮" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreve a sala..." className="resize-none" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gaming">🎮 Gaming</SelectItem>
                    <SelectItem value="music">🎵 Música</SelectItem>
                    <SelectItem value="talk">💬 Conversa</SelectItem>
                    <SelectItem value="study">📚 Estudo</SelectItem>
                    <SelectItem value="other">🌐 Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Max. Membros</Label>
                <Input type="number" value={form.max_members} onChange={(e) => setForm({ ...form, max_members: Number(e.target.value) })} min={2} max={500} />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-secondary rounded-lg p-3">
              <Switch checked={form.is_private} onCheckedChange={(v) => setForm({ ...form, is_private: v })} />
              <div>
                <Label className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-yellow-400" /> Sala Privada</Label>
              </div>
            </div>
            {form.is_private && (
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Define uma password..." />
              </div>
            )}
            <Button onClick={() => createRoom.mutate()} disabled={!form.name.trim() || createRoom.isPending} className="w-full gap-2">
              <Plus className="w-4 h-4" /> Criar Sala
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}