const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function MessagesPanel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const [toUser, setToUser] = useState("");
  const [message, setMessage] = useState("");
  const qc = useQueryClient();

  const { data: received = [] } = useQuery({
    queryKey: ["dm-received", user?.id],
    queryFn: () => user?.id ? db.entities.DirectMessage.filter({ to_user_id: user.id }, "-created_date", 30) : [],
    enabled: !!user?.id,
    refetchInterval: 20000,
  });

  const unread = received.filter(m => !m.is_read).length;

  const sendMsg = useMutation({
    mutationFn: async () => {
      // Find target
      let targets = await db.entities.UserProfile.filter({ username: toUser }, "-created_date", 1);
      if (!targets.length) targets = await db.entities.UserProfile.filter({ user_id: toUser }, "-created_date", 1);
      if (!targets.length) throw new Error("Utilizador não encontrado!");
      const target = targets[0];

      await db.entities.DirectMessage.create({
        from_user_id: user.id,
        from_username: user.full_name,
        to_user_id: target.user_id,
        to_username: target.username,
        content: message,
      });

      await db.entities.Notification.create({
        user_id: target.user_id,
        type: "message",
        title: `💬 Mensagem de ${user.full_name}`,
        body: message.slice(0, 80),
        from_user_id: user.id,
        from_username: user.full_name,
      });

      return target;
    },
    onSuccess: (target) => {
      toast.success(`Mensagem enviada para ${target.username}!`);
      setComposing(false);
      setToUser("");
      setMessage("");
    },
    onError: (e) => toast.error(e.message || "Erro ao enviar"),
  });

  const markRead = useMutation({
    mutationFn: (id) => db.entities.DirectMessage.update(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dm-received"] }),
  });

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => setOpen(o => !o)}>
        <MessageCircle className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[9px] flex items-center justify-center font-bold text-white">
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
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Mensagens</span>
                  {unread > 0 && <Badge className="bg-primary text-xs px-1.5">{unread}</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setComposing(c => !c)} title="Nova mensagem">
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {composing && (
                <div className="p-3 bg-secondary border-b border-border space-y-2">
                  <Input value={toUser} onChange={e => setToUser(e.target.value)} placeholder="Para (nome ou ID)..." className="h-8 text-xs" />
                  <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Escreve a mensagem..." className="h-8 text-xs"
                    onKeyDown={e => e.key === "Enter" && message.trim() && toUser.trim() && sendMsg.mutate()} />
                  <Button size="sm" className="w-full h-7 text-xs gap-1" disabled={!message.trim() || !toUser.trim() || sendMsg.isPending}
                    onClick={() => sendMsg.mutate()}>
                    <Send className="w-3 h-3" /> Enviar
                  </Button>
                </div>
              )}

              <div className="max-h-80 overflow-y-auto">
                {received.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">Sem mensagens</p>
                  </div>
                ) : (
                  received.map(msg => (
                    <div
                      key={msg.id}
                      onClick={() => !msg.is_read && markRead.mutate(msg.id)}
                      className={`flex items-start gap-3 p-3 border-b border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors ${!msg.is_read ? "bg-primary/5" : ""}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-purple-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {(msg.from_username || "?")[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{msg.from_username}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{msg.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {msg.created_date ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true, locale: ptBR }) : "agora"}
                        </p>
                      </div>
                      {!msg.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0" />}
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