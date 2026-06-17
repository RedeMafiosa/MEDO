const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Image, Smile, Users, Lock, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import MediaUploadButton from "@/components/shared/MediaUploadButton";
import EmojiPicker from "@/components/shared/EmojiPicker";
import RichTextToolbar from "@/components/shared/RichTextToolbar";
import TagBadge from "@/components/tags/TagBadge";
import { useUserTagsByUserId } from "@/hooks/useUserTags";

function RoomUserTags({ authorId }) {
  const tags = useUserTagsByUserId(authorId);
  if (!tags.length) return null;
  return (
    <span className="flex items-center gap-0.5">
      {tags.map(tag => <TagBadge key={tag.id} tag={tag} alwaysAnimate={true} />)}
    </span>
  );
}

export default function RoomChat({ room, user, onLeave }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [pendingMedia, setPendingMedia] = useState(null);
  const bottomRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["room-messages", room.id],
    queryFn: () => db.entities.RoomMessage.filter({ room_id: room.id }, "created_date", 100),
    refetchInterval: 2000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = useMutation({
    mutationFn: async () => {
      let media_url = null, media_type = "text";
      if (pendingMedia) {
        const res = await db.integrations.Core.UploadFile({ file: pendingMedia.file });
        media_url = res.file_url;
        media_type = pendingMedia.type;
      }
      return db.entities.RoomMessage.create({
        room_id: room.id,
        author_id: user?.id || "anon",
        author_name: user?.full_name || "Anónimo",
        content: text,
        media_url,
        media_type: media_url ? media_type : "text",
        formatting: { bold: isBold, italic: isItalic, underline: isUnderline },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["room-messages", room.id] });
      setText("");
      setPendingMedia(null);
    },
  });

  const handleSend = () => {
    if (!text.trim() && !pendingMedia) return;
    sendMsg.mutate();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onLeave}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-xl">{room.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-bold">{room.name}</p>
            {room.is_private && <Lock className="w-3 h-3 text-yellow-400" />}
          </div>
          {room.description && <p className="text-xs text-muted-foreground">{room.description}</p>}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{room.members_count || 0}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => {
          const isOwn = msg.author_id === (user?.id || "anon");
          const timeAgo = msg.created_date ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true, locale: ptBR }) : "";
          return (
            <div key={msg.id} className={`flex items-start gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {(msg.author_name || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {!isOwn && <span className="text-xs font-semibold">{msg.author_name}</span>}
                  {!isOwn && <RoomUserTags authorId={msg.author_id} />}
                  <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
                </div>
                {msg.content && (
                  <div className={`px-3 py-2 rounded-2xl text-sm ${isOwn ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    <span style={{
                      fontWeight: msg.formatting?.bold ? "bold" : "normal",
                      fontStyle: msg.formatting?.italic ? "italic" : "normal",
                      textDecoration: msg.formatting?.underline ? "underline" : "none",
                    }}>{msg.content}</span>
                  </div>
                )}
                {msg.media_url && (
                  <img src={msg.media_url} alt="" className="rounded-xl max-w-xs max-h-48 object-cover" />
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm p-3 space-y-2">
        <RichTextToolbar isBold={isBold} isItalic={isItalic} isUnderline={isUnderline}
          onBold={() => setIsBold(!isBold)} onItalic={() => setIsItalic(!isItalic)} onUnderline={() => setIsUnderline(!isUnderline)} />
        {pendingMedia && (
          <div className="relative inline-block ml-2">
            <img src={URL.createObjectURL(pendingMedia.file)} alt="" className="w-14 h-14 object-cover rounded" />
            <button onClick={() => setPendingMedia(null)} className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-white text-[10px]">×</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MediaUploadButton onUpload={(f, t) => setPendingMedia({ file: f, type: t })} compact />
          <EmojiPicker onSelect={emoji => setText(prev => prev + emoji)} />
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Mensagem em #${room.name}...`}
            className="flex-1 bg-secondary border-none"
            style={{
              fontWeight: isBold ? "bold" : "normal",
              fontStyle: isItalic ? "italic" : "normal",
              textDecoration: isUnderline ? "underline" : "none",
            }}
          />
          <Button size="icon" className="h-9 w-9 flex-shrink-0" onClick={handleSend} disabled={sendMsg.isPending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}