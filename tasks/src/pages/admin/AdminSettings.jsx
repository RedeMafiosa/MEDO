const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Palette, Image, MessageCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    site_name: "FlashStream", primary_color: "#8B5CF6", secondary_color: "#1E1B2E",
    background_color: "#0F0D1A", font_family: "Inter", logo_url: "", favicon_url: "",
    maintenance_mode: false, announcement: "", max_chat_length: 500,
    allow_gifs: true, allow_images: true
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => db.entities.SiteSettings.list("-created_date", 1),
  });

  useEffect(() => {
    if (settings[0]) setForm({ ...form, ...settings[0] });
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settings[0]) return db.entities.SiteSettings.update(settings[0].id, data);
      return db.entities.SiteSettings.create(data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["site-settings"] }); toast.success("Configurações guardadas!"); },
  });

  const handleSave = () => saveMutation.mutate(form);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" /> Configurações
      </h1>

      {/* General */}
      <Card>
        <CardHeader><CardTitle className="text-base">Geral</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Nome do Site</Label><Input value={form.site_name} onChange={e => setForm({...form, site_name: e.target.value})} /></div>
          <div className="space-y-2"><Label>Anúncio</Label><Textarea value={form.announcement} onChange={e => setForm({...form, announcement: e.target.value})} placeholder="Mensagem de anúncio (opcional)" /></div>
          <div className="flex items-center gap-3">
            <Switch checked={form.maintenance_mode} onCheckedChange={v => setForm({...form, maintenance_mode: v})} />
            <Label className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" />Modo Manutenção</Label>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="w-4 h-4" />Tema</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cor Primária</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primary_color} onChange={e => setForm({...form, primary_color: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
                <Input value={form.primary_color} onChange={e => setForm({...form, primary_color: e.target.value})} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor Secundária</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.secondary_color} onChange={e => setForm({...form, secondary_color: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
                <Input value={form.secondary_color} onChange={e => setForm({...form, secondary_color: e.target.value})} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor de Fundo</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.background_color} onChange={e => setForm({...form, background_color: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
                <Input value={form.background_color} onChange={e => setForm({...form, background_color: e.target.value})} className="flex-1" />
              </div>
            </div>
          </div>
          <div className="space-y-2"><Label>Fonte</Label><Input value={form.font_family} onChange={e => setForm({...form, font_family: e.target.value})} /></div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Image className="w-4 h-4" />Imagens</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>URL do Logo</Label><Input value={form.logo_url} onChange={e => setForm({...form, logo_url: e.target.value})} /></div>
          <div className="space-y-2"><Label>URL do Favicon</Label><Input value={form.favicon_url} onChange={e => setForm({...form, favicon_url: e.target.value})} /></div>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="w-4 h-4" />Chat</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Tamanho máximo de mensagem</Label><Input type="number" value={form.max_chat_length} onChange={e => setForm({...form, max_chat_length: Number(e.target.value)})} /></div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><Switch checked={form.allow_gifs} onCheckedChange={v => setForm({...form, allow_gifs: v})} /><Label>Permitir GIFs</Label></div>
            <div className="flex items-center gap-2"><Switch checked={form.allow_images} onCheckedChange={v => setForm({...form, allow_images: v})} /><Label>Permitir Imagens</Label></div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="gap-2 w-full" disabled={saveMutation.isPending}>
        <Save className="w-4 h-4" /> Guardar Configurações
      </Button>
    </div>
  );
}