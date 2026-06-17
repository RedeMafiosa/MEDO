const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import MediaUploadButton from "@/components/shared/MediaUploadButton";
import EmojiPicker from "@/components/shared/EmojiPicker";
import RichTextToolbar from "@/components/shared/RichTextToolbar";
import { useNavigate } from "react-router-dom";
import TagBadge from "@/components/tags/TagBadge";
import { useUserTagsByUserId } from "@/hooks/useUserTags";

function ChatUserTags({ authorId }) {
  const tags = useUserTagsByUserId(authorId);
  if (!tags.length) return null;
  return (
    <span className="flex items-center gap-0.5">
      {tags.map(tag => <TagBadge key={tag.id} tag={tag} alwaysAnimate={true} />)}
    </span>
  );
}

function renderContent(content) {
  if (!content) return null;
  // Highlight @mention or !mention
  const parts = content.split(/(@\w+|!\w+)/g);
  return parts.map((part, i) => {
    if (/^[@!]\w+/.test(part)) {
      return <span key={i} className="text-primary font-bold bg-primary/10 rounded px-0.5">{part}</span>;
    }
    return part;
  });
}

export default function GeneralChat() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [pendingMedia, setPendingMedia] = useState(null);
  const [showOnline, setShowOnline] = useState(false);
  const bottomRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["general-messages"],
    queryFn: () => db.entities.GeneralMessage.list("created_date", 100),
    refetchInterval: 2000,
  });

  // Online users from UserProfile
  const { data: onlineProfiles = [] } = useQuery({
    queryKey: ["online-profiles"],
    queryFn: () => db.entities.UserProfile.filter({ is_online: true }, "-updated_date", 50),
    refetchInterval: 15000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark self online
  useEffect(() => {
    if (!user?.id) return;
    db.entities.UserProfile.filter({ user_id: user.id }, "-created_date", 1).then(profiles => {
      if (profiles[0]) db.entities.UserProfile.update(profiles[0].id, { is_online: true });
    });
  }, [user?.id]);

  const sendMsg = useMutation({
    mutationFn: async () => {
      let media_url = null, media_type = "text";
      if (pendingMedia) {
        const res = await db.integrations.Core.UploadFile({ file: pendingMedia.file });
        media_url = res.file_url;
        media_type = pendingMedia.type;
      }
      return db.entities.GeneralMessage.create({
        author_id: user?.id || "anon",
        author_name: user?.full_name || "Anónimo",
        content: text,
        media_url,
        media_type: media_url ? media_type : "text",
        is_bold: isBold, is_italic: isItalic, is_underline: isUnderline,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["general-messages"] });
      setText(""); setPendingMedia(null);
    },
  });

  const handleSend = () => {
    if (!text.trim() && !pendingMedia) return;
    sendMsg.mutate();
  };

  const handleNameClick = async (authorId, authorName) => {
    if (!authorId || authorId === "anon") return;
    // Try find profile by user_id
    const profiles = await db.entities.UserProfile.filter({ user_id: authorId }, "-created_date", 1);
    if (profiles.length) {
      navigate(`/profile?id=${authorId}`);
    }
  };

  const handleMention = (name) => {
    setText(prev => prev + `@${name} `);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Main chat */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <div>
            <h1 className="font-display font-bold">Chat Geral</h1>
            <p className="text-xs text-muted-foreground">Chat da comunidade FlashStream</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowOnline(!showOnline)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${showOnline ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              <Users className="w-3.5 h-3.5" />
              Online ({onlineProfiles.length})
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.map(msg => {
            const isOwn = msg.author_id === (user?.id || "anon");
            const timeAgo = msg.created_date
              ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true, locale: ptBR })
              : "";
            return (
              <div key={msg.id} className="flex items-start gap-2.5 hover:bg-secondary/30 rounded-lg px-2 py-1 group transition-colors">
                <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                  <AvatarFallback className={`text-xs font-bold ${isOwn ? "bg-primary/30 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {(msg.author_name || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-sm font-semibold cursor-pointer hover:underline ${isOwn ? "text-primary" : "text-foreground"}`}
                      onClick={() => handleNameClick(msg.author_id, msg.author_name)}
                    >
                      {msg.author_name}
                    </span>
                    <ChatUserTags authorId={msg.author_id} />
                    <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{timeAgo}</span>
                    {/* Mention button on hover */}
                    {!isOwn && (
                      <button
                        className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                        onClick={() => handleMention(msg.author_name)}
                      >@mencionar</button>
                    )}
                  </div>
                  {msg.content && (
                    <p className="text-sm break-words" style={{
                      fontWeight: msg.is_bold ? "bold" : "normal",
                      fontStyle: msg.is_italic ? "italic" : "normal",
                      textDecoration: msg.is_underline ? "underline" : "none",
                    }}>
                      {renderContent(msg.content)}
                    </p>
                  )}
                  {msg.media_url && (
                    <img src={msg.media_url} alt="" className="mt-1 rounded-xl max-w-xs max-h-48 object-cover" />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
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
            <EmojiPicker onSelect={e => setText(prev => prev + e)} />
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Escreve uma mensagem... usa @Nome para mencionar"
              className="flex-1 bg-secondary border-none"
              style={{
                fontWeight: isBold ? "bold" : "normal",
                fontStyle: isItalic ? "italic" : "normal",
                textDecoration: isUnderline ? "underline" : "none",
              }}
            />
            <Button size="icon" className="h-9 w-9" onClick={handleSend} disabled={sendMsg.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Online panel */}
      {showOnline && (
        <div className="w-56 border-l border-border bg-card/80 flex flex-col flex-shrink-0">
          <div className="px-3 py-3 border-b border-border">
            <p className="text-xs font-semibold text-green-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online — {onlineProfiles.length}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {onlineProfiles.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Ninguém online</p>
            ) : (
              onlineProfiles.map(p => (
                <button
                  key={p.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors text-left"
                  onClick={() => navigate(`/profile?id=${p.user_id}`)}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-purple-800 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0 relative">
                    {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : p.username?.[0]?.toUpperCase()}
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-card" />
                  </div>
                  <span className="text-xs font-medium truncate">{p.username}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}