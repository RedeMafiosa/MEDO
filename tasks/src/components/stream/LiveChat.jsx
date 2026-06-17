const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Image, Gift, Smile, Crown, Shield, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const badgeIcons = {
  mod: { icon: Shield, color: "text-green-400" },
  vip: { icon: Crown, color: "text-yellow-400" },
  subscriber: { icon: Star, color: "text-primary" },
  admin: { icon: Shield, color: "text-red-400" },
};

const nameColors = [
  "text-red-400", "text-blue-400", "text-green-400", "text-yellow-400",
  "text-purple-400", "text-pink-400", "text-cyan-400", "text-orange-400"
];

function ChatBubble({ msg }) {
  const BadgeInfo = badgeIcons[msg.badge];
  const colorClass = msg.color || nameColors[msg.username?.charCodeAt(0) % nameColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`px-3 py-1 hover:bg-secondary/50 transition-colors text-sm ${
        msg.message_type === "donation" ? "bg-yellow-500/10 border-l-2 border-yellow-500" : ""
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {BadgeInfo && <BadgeInfo.icon className={`w-3 h-3 ${BadgeInfo.color} inline`} />}
        <Link to={`/profile?username=${encodeURIComponent(msg.username)}`} className={`font-semibold ${colorClass} hover:underline`}>{msg.username}</Link>
        <span className="text-muted-foreground">:</span>
      </span>{" "}
      {msg.message_type === "donation" && (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-none text-[10px] mr-1">
          <Gift className="w-3 h-3 mr-0.5" />{msg.donation_amount} tokens
        </Badge>
      )}
      {msg.media_url ? (
        <img src={msg.media_url} alt="media" className="max-w-[200px] max-h-[120px] rounded mt-1 inline-block" />
      ) : (
        <span className="text-foreground/90">{msg.content}</span>
      )}
    </motion.div>
  );
}

export default function LiveChat({ streamId }) {
  const [message, setMessage] = useState("");
  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["chat", streamId],
    queryFn: () => db.entities.ChatMessage.filter({ stream_id: streamId }, "-created_date", 50),
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (data) => db.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", streamId] });
      setMessage("");
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate({
      stream_id: streamId,
      username: "Visitante" + Math.floor(Math.random() * 999),
      content: message,
      message_type: "text",
      badge: "none",
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    sendMutation.mutate({
      stream_id: streamId,
      username: "Visitante" + Math.floor(Math.random() * 999),
      content: file.name,
      message_type: file.type.startsWith("image/") ? "image" : "text",
      media_url: file_url,
      badge: "none",
    });
  };

  const sortedMessages = [...messages].reverse();

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm">Chat ao Vivo</h3>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-live-pulse" />
          <span className="text-xs text-muted-foreground">{messages.length}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {sortedMessages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-border">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enviar mensagem..."
              className="pr-20 bg-secondary border-none h-9 text-sm"
              maxLength={500}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <label className="p-1 rounded hover:bg-muted cursor-pointer transition-colors">
                <Image className="w-4 h-4 text-muted-foreground" />
                <input type="file" accept="image/*,.gif" className="hidden" onChange={handleFileUpload} />
              </label>
              <button type="button" className="p-1 rounded hover:bg-muted transition-colors">
                <Smile className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <Button type="submit" size="sm" className="h-9 px-3" disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}