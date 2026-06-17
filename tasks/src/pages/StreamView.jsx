const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useRef } from "react";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import StreamPlayer from "@/components/stream/StreamPlayer";
import LiveChat from "@/components/stream/LiveChat";
import StreamCard from "@/components/stream/StreamCard";
import BadgeGiftPanel from "@/components/stream/BadgeGiftPanel";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { addXP, XP_GAINS } from "@/lib/xpSystem.js";
import { toast } from "sonner";

export default function StreamView() {
  const { user } = useAuth();
  const xpIntervalRef = useRef(null);

  // Award 100 XP every 5 minutes while watching a live stream
  useEffect(() => {
    if (!user?.id) return;
    xpIntervalRef.current = setInterval(async () => {
      const profiles = await db.entities.UserProfile.filter({ user_id: user.id }, "-created_date", 1);
      if (profiles[0]) {
        const oldLevel = profiles[0].level || 1;
        const result = await addXP(base44, user.id, profiles[0].id, profiles[0].xp || 0, XP_GAINS.WATCH_LIVE_5MIN);
        toast.success("+100 XP por ver a live! 🎮");
        if (result.newLevel > oldLevel) toast.success(`🎉 Subiste para Nível ${result.newLevel}!`);
      }
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(xpIntervalRef.current);
  }, [user?.id]);

  const urlParams = new URLSearchParams(window.location.search);
  const streamId = window.location.pathname.split("/stream/")[1];

  const { data: stream, isLoading } = useQuery({
    queryKey: ["stream", streamId],
    queryFn: async () => {
      const streams = await db.entities.Stream.filter({ id: streamId });
      return streams[0];
    },
    enabled: !!streamId,
  });

  const { data: relatedStreams = [] } = useQuery({
    queryKey: ["related-streams", stream?.category],
    queryFn: () => db.entities.Stream.filter(
      { category: stream.category },
      "-viewers",
      6
    ),
    enabled: !!stream?.category,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-muted-foreground mb-4">Stream não encontrada</p>
        <Link to="/streams" className="text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <StreamPlayer stream={stream} />

        {/* Badge gift button — only on live streams */}
        {stream.status === "live" && (
          <div className="flex items-center gap-2">
            <BadgeGiftPanel stream={stream} />
          </div>
        )}

        {/* Description */}
        {stream.description && (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-2">Sobre esta stream</h3>
            <p className="text-sm text-muted-foreground">{stream.description}</p>
          </div>
        )}

        {/* Related */}
        {relatedStreams.filter(s => s.id !== stream.id).length > 0 && (
          <div>
            <h3 className="text-lg font-display font-bold mb-3">Streams Semelhantes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedStreams.filter(s => s.id !== stream.id).slice(0, 3).map(s => (
                <StreamCard key={s.id} stream={s} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      <div className="w-full lg:w-[350px] h-[400px] lg:h-auto">
        <LiveChat streamId={streamId} />
      </div>
    </div>
  );
}