const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Image, Smile, Send, X, ChevronDown, ChevronUp, Reply, Rss } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import MediaUploadButton from "@/components/shared/MediaUploadButton";
import FeedPostCard from "@/components/feed/FeedPostCard";
import { addXP, XP_GAINS, levelFromXP } from "@/lib/xpSystem.js";

export default function Feed() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isPosting, setIsPosting] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feed-posts"],
    queryFn: () => db.entities.FeedPost.list("-created_date", 50),
  });

  const createPost = useMutation({
    mutationFn: async () => {
      setIsPosting(true);
      const uploadedUrls = [];
      const uploadedTypes = [];
      for (const f of mediaFiles) {
        const { file_url } = await db.integrations.Core.UploadFile({ file: f.file });
        uploadedUrls.push(file_url);
        uploadedTypes.push(f.type);
      }
      return db.entities.FeedPost.create({
        author_id: user?.id || "anon",
        author_name: user?.full_name || "Anónimo",
        content,
        media_urls: uploadedUrls,
        media_types: uploadedTypes,
        likes: 0,
        liked_by: [],
        comments_count: 0,
      });
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
      setContent("");
      setMediaFiles([]);
      setIsPosting(false);
      toast.success("Publicado! +10 XP 🎉");
      // Award 10 XP for posting and update DB
      if (user?.id) {
        const profiles = await db.entities.UserProfile.filter({ user_id: user.id }, "-created_date", 1);
        if (profiles[0]) {
          const oldLevel = profiles[0].level || 1;
          const result = await addXP(base44, user.id, profiles[0].id, profiles[0].xp || 0, XP_GAINS.POST_FEED);
          qc.invalidateQueries({ queryKey: ["profile-me"] });
          if (result.newLevel > oldLevel) toast.success(`🎉 Subiste para Nível ${result.newLevel}!`);
        } else {
          // Create profile if doesn't exist
          await db.entities.UserProfile.create({
            user_id: user.id, username: user.full_name || "User",
            xp: XP_GAINS.POST_FEED, level: 1
          });
          qc.invalidateQueries({ queryKey: ["profile-me"] });
        }
      }
    },
    onError: () => setIsPosting(false),
  });

  const handleAddMedia = (file, type) => {
    setMediaFiles(prev => [...prev, { file, type, preview: URL.createObjectURL(file) }]);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Rss className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-display font-bold">Feed</h1>
      </div>

      {/* Post Composer */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {(user?.full_name || "U")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="O que está a acontecer? Partilha com a comunidade..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="bg-secondary border-none resize-none min-h-[80px]"
            />
          </div>
        </div>

        {/* Media Previews */}
        {mediaFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 ml-13">
            {mediaFiles.map((m, i) => (
              <div key={i} className="relative group">
                <img src={m.preview} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
                <button
                  onClick={() => setMediaFiles(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MediaUploadButton onUpload={handleAddMedia} accept="image/*,image/gif" label="Foto/GIF" />
          </div>
          <Button
            size="sm"
            onClick={() => createPost.mutate()}
            disabled={(!content.trim() && mediaFiles.length === 0) || isPosting}
            className="gap-2"
          >
            {isPosting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            Publicar
          </Button>
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Rss className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Ainda não há publicações. Sê o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <FeedPostCard post={post} user={user} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}