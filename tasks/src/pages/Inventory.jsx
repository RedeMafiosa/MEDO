const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Send, Search, Filter, Star, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const RARITY_COLORS = {
  common: { label: "Comum", color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/30" },
  rare: { label: "Raro", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/40" },
  epic: { label: "Épico", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/40" },
  legendary: { label: "Lendário", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/50" },
};

const TYPE_LABELS = {
  badge: "🏅 Badge", figurinha: "🎭 Figurinha", gif: "🎞️ GIF",
  emote: "😊 Emote", gem_item: "💎 Gema", token_item: "🪙 Token"
};

export default function Inventory() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);
  const [sendTarget, setSendTarget] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inventory", user?.id],
    queryFn: () => user?.id ? db.entities.Inventory.filter({ owner_id: user.id }, "-created_date", 100) : [],
    enabled: !!user?.id,
  });

  const sendMutation = useMutation({
    mutationFn: async ({ item, target }) => {
      // Find target user profile by username or ID
      let targetProfiles = await db.entities.UserProfile.filter({ username: target }, "-created_date", 1);
      if (!targetProfiles.length) {
        targetProfiles = await db.entities.UserProfile.filter({ user_id: target }, "-created_date", 1);
      }
      if (!targetProfiles.length) throw new Error("Utilizador não encontrado!");
      const targetProfile = targetProfiles[0];

      // Move item to target
      await db.entities.Inventory.update(item.id, {
        owner_id: targetProfile.user_id,
        owner_username: targetProfile.username
      });

      // Create notification for receiver
      await db.entities.Notification.create({
        user_id: targetProfile.user_id,
        type: "transfer_received",
        title: "🎁 Item Recebido!",
        body: `${user.full_name} enviou-te um ${item.item_name}`,
        from_user_id: user.id,
        from_username: user.full_name,
        data: { item_name: item.item_name, item_image: item.item_image, item_type: item.item_type }
      });

      return targetProfile;
    },
    onSuccess: (targetProfile, { item }) => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(`${item.item_name} enviado para ${targetProfile.username}!`);
      setSelectedItem(null);
      setSendTarget("");
    },
    onError: (err) => toast.error(err.message || "Erro ao enviar item"),
  });

  const filtered = filter === "all" ? items : items.filter(i => i.item_type === filter);
  const types = [...new Set(items.map(i => i.item_type))];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Package className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Faz login para ver o teu inventário</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Inventário
          </h1>
          <p className="text-sm text-muted-foreground">{items.length} itens na tua coleção</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === "all" ? "default" : "secondary"} size="sm" onClick={() => setFilter("all")}>
          Todos ({items.length})
        </Button>
        {types.map(type => (
          <Button key={type} variant={filter === type ? "default" : "secondary"} size="sm" onClick={() => setFilter(type)}>
            {TYPE_LABELS[type] || type} ({items.filter(i => i.item_type === type).length})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Inventário Vazio</h3>
          <p className="text-muted-foreground text-sm">Compra itens na loja para os ver aqui!</p>
          <Button className="mt-4 gap-2" onClick={() => window.location.href = "/store"}>
            <Star className="w-4 h-4" /> Ir à Loja
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const rarity = RARITY_COLORS[item.item_rarity] || RARITY_COLORS.common;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                  <Card
                    className={`border ${rarity.border} bg-card hover:scale-105 cursor-pointer transition-all group`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className={`aspect-square rounded-xl overflow-hidden mb-2 ${rarity.bg} flex items-center justify-center relative`}>
                        {item.item_image ? (
                          <img src={item.item_image} alt={item.item_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">🎁</span>
                        )}
                        {item.quantity > 1 && (
                          <Badge className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0 border-0">x{item.quantity}</Badge>
                        )}
                      </div>
                      <p className="text-xs font-semibold truncate">{item.item_name}</p>
                      <p className={`text-[10px] ${rarity.color} font-medium`}>{rarity.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{TYPE_LABELS[item.item_type] || item.item_type}</p>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                        <Button size="sm" className="w-full h-6 text-xs gap-1">
                          <Send className="w-3 h-3" /> Enviar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Send Item Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => { setSelectedItem(null); setSendTarget(""); }}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Enviar Item
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* Item Preview */}
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
                  {selectedItem.item_image ? (
                    <img src={selectedItem.item_image} alt={selectedItem.item_name} className="w-full h-full object-cover" />
                  ) : <span className="text-3xl">🎁</span>}
                </div>
                <div>
                  <p className="font-bold">{selectedItem.item_name}</p>
                  <p className="text-sm text-muted-foreground">{TYPE_LABELS[selectedItem.item_type]}</p>
                  <Badge className={`${RARITY_COLORS[selectedItem.item_rarity]?.bg} ${RARITY_COLORS[selectedItem.item_rarity]?.color} border-0 text-xs mt-1`}>
                    {RARITY_COLORS[selectedItem.item_rarity]?.label}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Enviar para (nome ou ID do jogador):</p>
                <Input
                  value={sendTarget}
                  onChange={e => setSendTarget(e.target.value)}
                  placeholder="Ex: ProGamer99 ou ID do jogador"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg text-xs text-yellow-300">
                ⚠️ Atenção: Após enviar, o item sai do teu inventário permanentemente!
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setSelectedItem(null); setSendTarget(""); }}>Cancelar</Button>
                <Button
                  className="flex-1 gap-2"
                  disabled={!sendTarget.trim() || sendMutation.isPending}
                  onClick={() => sendMutation.mutate({ item: selectedItem, target: sendTarget.trim() })}
                >
                  <Send className="w-4 h-4" />
                  {sendMutation.isPending ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}