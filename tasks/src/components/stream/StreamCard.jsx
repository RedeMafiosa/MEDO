import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Eye, Users } from "lucide-react";

export default function StreamCard({ stream, featured = false }) {
  return (
    <Link
      to={`/stream/${stream.id}`}
      className={`group block rounded-xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:glow-purple-sm ${
        featured ? "col-span-2 row-span-2" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={stream.thumbnail_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80"}
          alt={stream.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Live Badge */}
        {stream.status === "live" && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <Badge className="bg-red-600 text-white border-none text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-live-pulse inline-block" />
              AO VIVO
            </Badge>
          </div>
        )}
        {/* Viewers */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded px-2 py-0.5">
          <Eye className="w-3 h-3 text-red-400" />
          <span className="text-[11px] font-medium">{(stream.viewers || 0).toLocaleString()}</span>
        </div>
        {/* Category */}
        {stream.game && (
          <div className="absolute bottom-2 right-2 bg-primary/80 backdrop-blur-sm rounded px-2 py-0.5">
            <span className="text-[10px] font-semibold text-white">{stream.game}</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="p-3 flex gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-800 flex-shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden">
          {stream.streamer_avatar ? (
            <img src={stream.streamer_avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            stream.streamer_name?.[0]?.toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
            {stream.title}
          </h3>
          <p className="text-xs text-muted-foreground truncate">{stream.streamer_name}</p>
          <div className="flex items-center gap-2 mt-1">
            {stream.tags?.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}