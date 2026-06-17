const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Lock, Users, Hash, Gamepad2, Music, Mic, BookOpen, LogIn, Trash2, Shield, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import RoomChat from "@/components/rooms/RoomChat";

const categoryIcons = {
  gaming: Gamepad2, music: Music, talk: Mic, study: BookOpen, other: Hash
};
const categoryColors = {
  gaming: "from-blue-500 to-purple-600",
  music: "from-pink-500 to-rose-600",
  talk: "from-green-500 to-emerald-600",
  study: "from-yellow-500 to-amber-600",
  other: "from-slate-500 to-slate-600"
};

export default function Rooms() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [pendingRoom, setPendingRoom] = useState(null);
  const [form, setForm] = useState({
    name: "", description: "", icon: "🎮", max_members: 50,
    is_private: false, password: "", category: "gaming"
  });

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => db.entities.Room.filter({ is_active: true }, "-created_date", 50)
  });

  // Stats públicas
  const { data: allUsers = [] } = useQuery({
    queryKey: ["rooms-stats-users"],
    queryFn: () => db.entities.User.list("-created_date", 200),
    staleTime: 60000,
  });
  const { data: onlineProfiles = [] } = useQuery({
    queryKey: ["rooms-stats-online"],
    queryFn: () => db.entities.UserProfile.filter({ is_online: true }, "-created_date", 100),
    staleTime: 15000,
    refetchInterval: 30000,
  });
  const adminOnline = allUsers.filter(u => u.role === "admin" && onlineProfiles.some(p => p.user_id === u.id));
  const totalRegistered = allUsers.length;
  const totalOnline = onlineProfiles.length;

  const deleteRoom = useMutation({
    mutationFn: (id) => db.entities.Room.update(id, { is_active: false }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rooms"] }); toast.success("Sala eliminada!"); }
  });

  const createRoom = useMutation({
    mutationFn: () => db.entities.Room.create({
      ...form,
      owner_id: user?.id || "anon",
      owner_name: user?.full_name || "Anónimo",
      members_count: 1
    }),
    onSuccess: (room) => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
      setShowCreate(false);
      setActiveRoom(room);
      setForm({ name: "", description: "", icon: "🎮", max_members: 50, is_private: false, password: "", category: "gaming" });
      toast.success("Sala criada!");
    }
  });

  const handleJoin = (room) => {
    if (room.is_private) {
      setPendingRoom(room);
      setPasswordInput("");
    } else {
      setActiveRoom(room);
    }
  };

  const handlePasswordJoin = () => {
    if (passwordInput === pendingRoom.password) {
      setActiveRoom(pendingRoom);
      setPendingRoom(null);
    } else {
      toast.error("Password incorreta!");
    }
  };

  if (activeRoom) {
    return <RoomChat room={activeRoom} user={user} onLeave={() => setActiveRoom(null)} />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-display font-bold">Salas</h1>
            <Badge className="bg-secondary text-muted-foreground">{rooms.length} salas</Badge>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Criar Sala
          </Button>
        </div>
        {/* Stats públicas */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
            <Shield className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-semibold text-red-400">Adm On: {adminOnline.length}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
            <UserCheck className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-semibold text-green-400">Online: {totalOnline}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Registos: {totalRegistered}</span>
          </div>
        </div>
      </div>

      {isLoading ?
      <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div> :

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room, i) => {
          const Icon = categoryIcons[room.category] || Hash;
          const gradient = categoryColors[room.category] || categoryColors.other;
          return (
            <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all group">
                  <div className={`h-2 bg-gradient-to-r opacity-100 ${gradient}`} />
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl`}>
                          {room.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold">{room.name}</p>
                            {room.is_private && <Lock className="w-3 h-3 text-yellow-400" />}
                          </div>
                          <p className="text-xs text-muted-foreground">por {room.owner_name}</p>
                        </div>
                      </div>
                    </div>
                    {room.description && <p className="text-xs text-muted-foreground line-clamp-2">{room.description}</p>}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{room.members_count || 0}/{room.max_members}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {(user?.id === room.owner_id || user?.role === "admin") && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs gap-1"
                            onClick={(e) => { e.stopPropagation(); deleteRoom.mutate(room.id); }}>
                            <Trash2 className="w-3 h-3" /> Desativar
                          </Button>
                        )}
                        <Button size="sm" onClick={() => handleJoin(room)} className="gap-1.5 h-7 px-3 text-xs">
                          <LogIn className="w-3 h-3" /> Entrar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>);

        })}
        </div>
      }

      {/* Password Dialog */}
      <Dialog open={!!pendingRoom} onOpenChange={() => setPendingRoom(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Lock className="w-5 h-5 text-yellow-400" /> Sala Privada
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Insere a password para entrar em <strong>{pendingRoom?.name}</strong></p>
          <Input
            type="password"
            placeholder="Password..."
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePasswordJoin()} />
          
          <Button onClick={handlePasswordJoin} className="w-full">Entrar</Button>
        </DialogContent>
      </Dialog>

      {/* Create Room Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Criar Sala
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome da Sala *</Label>
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
                <Label className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-yellow-400" />Sala Privada</Label>
                <p className="text-xs text-muted-foreground">Requer password para entrar</p>
              </div>
            </div>
            {form.is_private &&
            <div className="space-y-1.5">
                <Label>Password da Sala</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Define uma password..." />
              </div>
            }
            <Button onClick={() => createRoom.mutate()} disabled={!form.name.trim() || createRoom.isPending} className="w-full gap-2">
              <Plus className="w-4 h-4" /> Criar Sala
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}