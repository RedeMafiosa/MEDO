const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gift } from "lucide-react";
import { toast } from "sonner";

const RARITY_COLOR = {
  common: "border-gray-400/40 text-gray-400",
  rare: "border-blue-400/40 text-blue-400",
  epic: "border-purple-400/50 text-purple-400",
  legendary: "border-yellow-400/60 text-yellow-400",
};

export default function BadgeGiftPanel({ stream }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: myBadges = [] } = useQuery({
    queryKey: ["my-badges", user?.id],
    queryFn: () => db.entities.Inventory.filter({ owner_id: user.id, item_type: "badge" }, "-created_date", 50),
    enabled: !!user?.id && open,
  });

  const sendBadge = useMutation({
    mutationFn: async (badge) => {
      if (!user?.id) throw new Error("Faz login primeiro!");
      if (!stream?.created_by_id) throw new Error("Streamer não encontrado!");

      // Remove from my inventory
      await db.entities.Inventory.delete(badge.id);

      // Find or create streamer's inventory entry
      await db.entities.Inventory.create({
        owner_id: stream.created_by_id,
        owner_username: stream.streamer_name,
        item_type: badge.item_type,
        item_name: badge.item_name,
        item_description: badge.item_description,
        item_image: badge.item_image,
        item_rarity: badge.item_rarity,
        quantity: 1,
      });

      // Send notification to streamer
      await db.entities.Notification.create({
        user_id: stream.created_by_id,
        type: "badge_received",
        title: "🏅 Badge Recebido na Stream!",
        body: `${user.full_name} enviou-te o badge ${badge.item_name} durante a tua stream!`,
        from_user_id: user.id,
        from_username: user.full_name,
        data: { badge_name: badge.item_name, stream_title: stream.title },
      });
    },
    onSuccess: (_, badge) => {
      toast.success(`${badge.item_name} enviado ao streamer!`);
      qc.invalidateQueries({ queryKey: ["my-badges", user?.id] });
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  if (!user) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
        onClick={() => setOpen(true)}
      >
        <Gift className="w-3.5 h-3.5" /> Dar Badge
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-400" /> Enviar Badge ao Streamer
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mb-2">
            O badge sai do teu inventário e vai directamente para <strong>{stream?.streamer_name}</strong>.
          </p>
          {myBadges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Não tens badges no inventário.<br />
              <a href="/store" className="text-primary hover:underline text-xs">Comprar badges na loja →</a>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {myBadges.map((badge) => (
                <button
                  key={badge.id}
                  disabled={sendBadge.isPending}
                  onClick={() => sendBadge.mutate(badge)}
                  className={`p-2 rounded-xl border ${RARITY_COLOR[badge.item_rarity] || "border-border"} bg-secondary hover:bg-secondary/80 transition-all text-center`}
                >
                  <div className="text-3xl mb-1">
                    {badge.item_image
                      ? <img src={badge.item_image} alt="" className="w-8 h-8 mx-auto object-contain" />
                      : badge.item_name?.split(" ")[0]
                    }
                  </div>
                  <p className="text-[10px] font-semibold truncate">{badge.item_name}</p>
                  <p className={`text-[9px] ${RARITY_COLOR[badge.item_rarity]?.split(" ")[1] || "text-muted-foreground"}`}>
                    {badge.item_rarity}
                  </p>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}