const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Edit, Trash2, Radio } from "lucide-react";
import { toast } from "sonner";

const defaultStream = {
  title: "", streamer_name: "", category: "gaming", game: "",
  thumbnail_url: "", status: "offline", viewers: 0, followers: 0,
  total_views: 0, description: "", tags: [], is_featured: false, language: "pt"
};

export default function AdminStreams() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStream, setEditStream] = useState(null);
  const [form, setForm] = useState(defaultStream);

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["admin-all-streams"],
    queryFn: () => db.entities.Stream.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Stream.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-all-streams"] }); setDialogOpen(false); toast.success("Stream criada!"); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Stream.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-all-streams"] }); setDialogOpen(false); toast.success("Stream atualizada!"); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Stream.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-all-streams"] }); toast.success("Stream eliminada!"); },
  });

  const openCreate = () => { setEditStream(null); setForm(defaultStream); setDialogOpen(true); };
  const openEdit = (s) => { setEditStream(s); setForm({ ...defaultStream, ...s }); setDialogOpen(true); };
  const handleSave = () => {
    const data = { ...form, tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()) : form.tags };
    if (editStream) updateMutation.mutate({ id: editStream.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Radio className="w-6 h-6 text-primary" /> Gerir Streams
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" />Nova Stream</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editStream ? "Editar Stream" : "Nova Stream"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Nome do Streamer</Label>
                <Input value={form.streamer_name} onChange={e => setForm({...form, streamer_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["gaming","irl","music","creative","esports","talk_show","education","other"].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Ao Vivo</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="scheduled">Agendada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jogo</Label>
                <Input value={form.game} onChange={e => setForm({...form, game: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>URL do Thumbnail</Label>
                <Input value={form.thumbnail_url} onChange={e => setForm({...form, thumbnail_url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>URL do Vídeo / Canal (embed)</Label>
                <Input value={form.video_url || ""} onChange={e => setForm({...form, video_url: e.target.value})} placeholder="https://www.youtube.com/embed/... ou Twitch embed" />
                <p className="text-xs text-muted-foreground">Link embed do YouTube, Twitch, ou outro player</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Viewers</Label>
                  <Input type="number" value={form.viewers} onChange={e => setForm({...form, viewers: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Followers</Label>
                  <Input type="number" value={form.followers} onChange={e => setForm({...form, followers: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Views Totais</Label>
                  <Input type="number" value={form.total_views} onChange={e => setForm({...form, total_views: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Tags (separadas por vírgula)</Label>
                <Input value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_featured} onCheckedChange={v => setForm({...form, is_featured: v})} />
                <Label>Destaque</Label>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {editStream ? "Guardar Alterações" : "Criar Stream"}
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
                <TableHead>Stream</TableHead>
                <TableHead>Streamer</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Viewers</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {streams.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.streamer_name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{s.category}</Badge></TableCell>
                  <TableCell>
                    <Badge className={s.status === "live" ? "bg-red-600 text-white border-none" : "bg-secondary text-muted-foreground border-none"}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.viewers || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="w-4 h-4" /></Button>
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