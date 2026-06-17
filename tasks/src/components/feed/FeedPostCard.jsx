const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Reply, Send, ChevronDown, ChevronUp, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import MediaUploadButton from "@/components/shared/MediaUploadButton";
import { Link } from "react-router-dom";
import TagBadge from "@/components/tags/TagBadge";
import { useUserTagsByUserId } from "@/hooks/useUserTags";

function PostAuthorTags({ authorId }) {
  const tags = useUserTagsByUserId(authorId);
  if (!tags.length) return null;
  return (
    <span className="flex items-center gap-1 flex-wrap">
      {tags.map(tag => <TagBadge key={tag.id} tag={tag} alwaysAnimate={true} />)}
    </span>
  );
}

export default function FeedPostCard({ post, user }) {
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [commentMedia, setCommentMedia] = useState(null);
  const liked = post.liked_by?.includes(user?.id || "anon");

  const { data: comments = [] } = useQuery({
    queryKey: ["feed-comments", post.id],
    queryFn: () => db.entities.FeedComment.filter({ post_id: post.id }, "-created_date", 50),
    enabled: showComments,
  });

  const likePost = useMutation({
    mutationFn: async () => {
      const uid = user?.id || "anon";
      const newLiked = liked ? (post.liked_by || []).filter(id => id !== uid) : [...(post.liked_by || []), uid];
      return db.entities.FeedPost.update(post.id, { liked_by: newLiked, likes: newLiked.length });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed-posts"] }),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      let media_url = null;
      if (commentMedia) {
        const res = await db.integrations.Core.UploadFile({ file: commentMedia.file });
        media_url = res.file_url;
      }
      await db.entities.FeedComment.create({
        post_id: post.id,
        parent_comment_id: replyTo?.id || null,
        author_id: user?.id || "anon",
        author_name: user?.full_name || "Anónimo",
        content: commentText,
        media_url,
        likes: 0,
        liked_by: [],
      });
      await db.entities.FeedPost.update(post.id, { comments_count: (post.comments_count || 0) + 1 });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-comments", post.id] });
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
      setCommentText("");
      setReplyTo(null);
      setCommentMedia(null);
    },
  });

  const timeAgo = post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: ptBR }) : "";
  const topLevelComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_comment_id === parentId);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          {post.author_avatar ? <img src={post.author_avatar} alt="" className="w-full h-full object-cover rounded-full" /> : null}
          <AvatarFallback className="bg-primary/20 text-primary font-bold">{(post.author_name || "U")[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to={`/profile?user_id=${post.author_id}`} className="font-semibold text-sm hover:text-primary transition-colors">{post.author_name}</Link>
            <PostAuthorTags authorId={post.author_id} />
          </div>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>

      {/* Content */}
      {post.content && <p className="text-sm whitespace-pre-wrap">{post.content}</p>}

      {/* Media */}
      {post.media_urls?.length > 0 && (
        <div className={`grid gap-2 ${post.media_urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.media_urls.map((url, i) => (
            <img key={i} src={url} alt="" className="rounded-lg w-full object-cover max-h-80" />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-border">
        <button
          onClick={() => likePost.mutate()}
          className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-400"}`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span>{post.likes || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments_count || 0}</span>
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-3 pt-2">
          {/* Comment Input */}
          <div className="flex items-start gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{(user?.full_name || "U")[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              {replyTo && (
                <div className="flex items-center gap-2 bg-secondary rounded px-2 py-1 text-xs text-muted-foreground">
                  <Reply className="w-3 h-3" />
                  A responder a @{replyTo.author_name}
                  <button onClick={() => setReplyTo(null)} className="ml-auto"><X className="w-3 h-3" /></button>
                </div>
              )}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escreve um comentário..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="bg-secondary border-none resize-none text-sm min-h-[40px] max-h-24"
                  rows={1}
                />
              </div>
              {commentMedia && (
                <div className="relative inline-block">
                  <img src={URL.createObjectURL(commentMedia.file)} alt="" className="w-16 h-16 object-cover rounded" />
                  <button onClick={() => setCommentMedia(null)} className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between">
                <MediaUploadButton onUpload={(f, t) => setCommentMedia({ file: f, type: t })} accept="image/*,image/gif" label="Foto/GIF" compact />
                <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs"
                  disabled={!commentText.trim() && !commentMedia}
                  onClick={() => addComment.mutate()}
                >
                  <Send className="w-3 h-3" /> Comentar
                </Button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {topLevelComments.map(comment => (
              <CommentItem key={comment.id} comment={comment} replies={getReplies(comment.id)} user={user} onReply={setReplyTo} postId={post.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, replies, user, onReply, postId }) {
  const qc = useQueryClient();
  const [showReplies, setShowReplies] = useState(false);
  const liked = comment.liked_by?.includes(user?.id || "anon");
  const timeAgo = comment.created_date ? formatDistanceToNow(new Date(comment.created_date), { addSuffix: true, locale: ptBR }) : "";

  const likeComment = useMutation({
    mutationFn: async () => {
      const uid = user?.id || "anon";
      const newLiked = liked ? (comment.liked_by || []).filter(id => id !== uid) : [...(comment.liked_by || []), uid];
      return db.entities.FeedComment.update(comment.id, { liked_by: newLiked, likes: newLiked.length });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed-comments", postId] }),
  });

  return (
    <div className="flex items-start gap-2">
      <Avatar className="w-7 h-7 flex-shrink-0">
        <AvatarFallback className="bg-secondary text-xs font-bold">{(comment.author_name || "U")[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-secondary rounded-xl px-3 py-2">
          <Link to={`/profile?user_id=${comment.author_id}`} className="text-xs font-semibold mb-0.5 hover:text-primary transition-colors block">{comment.author_name}</Link>
          <p className="text-xs whitespace-pre-wrap">{comment.content}</p>
          {comment.media_url && <img src={comment.media_url} alt="" className="mt-1 rounded max-h-32 object-cover" />}
        </div>
        <div className="flex items-center gap-3 mt-1 ml-2">
          <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          <button onClick={() => likeComment.mutate()} className={`flex items-center gap-0.5 text-[10px] ${liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}>
            <Heart className={`w-3 h-3 ${liked ? "fill-current" : ""}`} /> {comment.likes || 0}
          </button>
          <button onClick={() => onReply(comment)} className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground">
            <Reply className="w-3 h-3" /> Responder
          </button>
          {replies.length > 0 && (
            <button onClick={() => setShowReplies(!showReplies)} className="text-[10px] text-primary hover:underline">
              {showReplies ? "Ocultar" : `Ver ${replies.length} resposta(s)`}
            </button>
          )}
        </div>
        {showReplies && replies.length > 0 && (
          <div className="mt-2 ml-4 space-y-2">
            {replies.map(r => (
              <div key={r.id} className="flex items-start gap-2">
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarFallback className="bg-secondary text-[10px]">{(r.author_name || "U")[0]}</AvatarFallback>
                </Avatar>
                <div className="bg-secondary rounded-xl px-3 py-1.5 flex-1">
                  <p className="text-[10px] font-semibold">{r.author_name}</p>
                  <p className="text-xs">{r.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}