import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Share2, Flag, Maximize, Volume2, VolumeX, Settings } from "lucide-react";

export default function StreamPlayer({ stream }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      {/* Video Area */}
      <div className="aspect-video relative group">
        {stream?.video_url ? (
          <iframe
            key={stream.video_url}
            src={stream.video_url}
            title={stream?.title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={stream?.thumbnail_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80"}
              alt={stream?.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            {/* Center play icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors glow-purple">
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </>
        )}

        {/* Live badge */}
        {stream?.status === "live" && (
          <div className="absolute top-4 left-4 pointer-events-none">
            <Badge className="bg-red-600 text-white border-none text-xs font-bold px-3 py-1 uppercase tracking-wider">
              <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-live-pulse inline-block" />
              AO VIVO
            </Badge>
          </div>
        )}

        {/* Bottom controls — só quando não há iframe */}
        {!stream?.video_url && (
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-white/80">
                <Eye className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium">{(stream?.viewers || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stream Info */}
      <div className="p-4 bg-card">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-800 flex-shrink-0 flex items-center justify-center text-lg font-bold overflow-hidden ring-2 ring-primary/30">
            {stream?.streamer_avatar ? (
              <img src={stream.streamer_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              stream?.streamer_name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{stream?.title || "Stream"}</h1>
            <p className="text-sm text-primary font-medium">{stream?.streamer_name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {stream?.game && (
                <Badge variant="secondary" className="text-xs">{stream.game}</Badge>
              )}
              {stream?.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isFollowing ? "secondary" : "default"}
              size="sm"
              className="gap-1.5"
              onClick={() => setIsFollowing(!isFollowing)}
            >
              <Heart className={`w-4 h-4 ${isFollowing ? "fill-red-500 text-red-500" : ""}`} />
              {isFollowing ? "A seguir" : "Seguir"}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}