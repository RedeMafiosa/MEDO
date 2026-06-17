const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Radio } from "lucide-react";
import { motion } from "framer-motion";
import StreamCard from "@/components/stream/StreamCard";

const cats = [
  { key: "all", label: "🌐 Todos" },
  { key: "gaming", label: "🎮 Gaming" },
  { key: "irl", label: "📷 IRL" },
  { key: "music", label: "🎵 Música" },
  { key: "creative", label: "🎨 Criativo" },
  { key: "esports", label: "🏆 Esports" },
  { key: "education", label: "📚 Educação" },
  { key: "talk_show", label: "🎙️ Talk Show" },
];

export default function Streams() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCat = urlParams.get("cat") || "all";
  const [category, setCategory] = useState(initialCat);
  const [search, setSearch] = useState("");

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["streams"],
    queryFn: () => db.entities.Stream.list("-viewers", 50),
  });

  const filtered = streams.filter(s => {
    const matchCat = category === "all" || s.category === category;
    const matchSearch = !search || s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.streamer_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.game?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const liveCount = filtered.filter(s => s.status === "live").length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Radio className="w-6 h-6 text-primary" />
            Streams
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {liveCount} ao vivo • {filtered.length} streams
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {cats.map(c => (
          <Button
            key={c.key}
            variant={category === c.key ? "default" : "secondary"}
            size="sm"
            onClick={() => setCategory(c.key)}
            className="flex-shrink-0"
          >
            {c.label}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma stream encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((stream, i) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <StreamCard stream={stream} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}