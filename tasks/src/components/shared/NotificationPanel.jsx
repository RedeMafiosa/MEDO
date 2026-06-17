const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, CheckCheck, Gift, ArrowRight, MessageCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const TYPE_ICON = {
  transfer_received: "🎁",
  transfer_sent: "📤",
  badge_received: "🏅",
  message: "💬",
  system: "⚡",
};

export default function NotificationPanel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => user?.id ? db.entities.Notification.filter({ user_id: user.id }, "-created_date", 20) : [],
    enabled: !!user?.id,
    refetchInterval: 15000,
  });

  const unread = notifications.filter(n => !n.is_read).length;

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unreadOnes = notifications.filter(n => !n.is_read);
      await Promise.all(unreadOnes.map(n => db.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markRead = useMutation({
    mutationFn: (id) => db.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="relative">
      <Button
        variant="ghost" size="icon"
        className="relative h-9 w-9"
        onClick={() => setOpen(o => !o)}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[9px] flex items-center justify-center font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-11 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Notificações</span>
                  {unread > 0 && <Badge className="bg-primary text-xs px-1.5">{unread}</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  {unread > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => markAllRead.mutate()}>
                      <CheckCheck className="w-3 h-3" /> Marcar tudo
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Bell className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">Sem notificações</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.is_read && markRead.mutate(notif.id)}
                      className={`flex items-start gap-3 p-3 border-b border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors ${!notif.is_read ? "bg-primary/5" : ""}`}
                    >
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-lg">
                        {TYPE_ICON[notif.type] || "⚡"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{notif.title}</p>
                        {notif.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {notif.created_date ? formatDistanceToNow(new Date(notif.created_date), { addSuffix: true, locale: ptBR }) : "agora"}
                        </p>
                      </div>
                      {!notif.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}