const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, TrendingUp, Gamepad2, Music, Palette, Mic, Trophy, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import StreamCard from "@/components/stream/StreamCard";

const categories = [
{ icon: Gamepad2, label: "Gaming", key: "gaming", color: "from-red-500 to-orange-500" },
{ icon: Mic, label: "IRL", key: "irl", color: "from-blue-500 to-cyan-500" },
{ icon: Music, label: "Música", key: "music", color: "from-green-500 to-emerald-500" },
{ icon: Palette, label: "Criativo", key: "creative", color: "from-purple-500 to-pink-500" },
{ icon: Trophy, label: "Esports", key: "esports", color: "from-yellow-500 to-amber-500" },
{ icon: GraduationCap, label: "Educação", key: "education", color: "from-indigo-500 to-blue-500" }];

export default function Home() {
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["streams"],
    queryFn: () => db.entities.Stream.list("-viewers", 12)
  });

  const liveStreams = streams.filter((s) => s.status === "live");
  const featuredStream = liveStreams[0] || streams[0];

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Hero */}
      {featuredStream &&
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 via-card to-card border border-border">
        
          <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8 rounded">
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-purple">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-display font-bold text-2xl tracking-wide">
                  Flash<span className="text-primary">Stream</span>
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight">
                A tua plataforma de <span className="text-primary">livestream</span> favorita
              </h1>
              <p className="text-muted-foreground max-w-md">
                Descobre streams incríveis, interage com os teus criadores favoritos e faz parte da comunidade.
              </p>
              <div className="flex gap-3">
                <Link to="/streams">
                  <Button className="gap-2 glow-purple-sm bg-[hsl(var(--primary))]">
                    <TrendingUp className="w-4 h-4" />
                    Ver Streams ao Vivo
                  </Button>
                </Link>
                <Link to="/store">
                  <Button variant="outline" className="gap-2">
                    Loja
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <Link to={`/stream/${featuredStream.id}`} className="relative aspect-video rounded-xl overflow-hidden group">
              <img
              src={featuredStream.thumbnail_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"}
              alt={featuredStream.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {featuredStream.status === "live" &&
            <Badge className="absolute top-3 left-3 bg-red-600 text-white border-none uppercase text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-live-pulse inline-block" />
                  AO VIVO
                </Badge>
            }
              <div className="absolute bottom-3 left-3">
                <p className="text-white font-semibold text-sm">{featuredStream.title}</p>
                <p className="text-white/70 text-xs">{featuredStream.streamer_name}</p>
              </div>
            </Link>
          </div>
        </motion.section>
      }

      {/* Categorias */}
      <section>
        <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          Categorias
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat, i) =>
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}>
            
              <Link
              to={`/streams?cat=${cat.key}`}
              className="block p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all group text-center">
              
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">{cat.label}</p>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Streams ao Vivo */}
      {liveStreams.length > 0 &&
      <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-live-pulse" />
              Ao Vivo Agora
            </h2>
            <Link to="/streams" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {liveStreams.slice(0, 8).map((stream, i) =>
          <motion.div
            key={stream.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}>
            
                <StreamCard stream={stream} />
              </motion.div>
          )}
          </div>
        </section>
      }

      {/* Recomendados */}
      <section>
        <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Recomendados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {streams.slice(0, 8).map((stream, i) =>
          <motion.div
            key={stream.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}>
            
              <StreamCard stream={stream} />
            </motion.div>
          )}
        </div>
      </section>

      {isLoading &&
      <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }

      {!isLoading && streams.length === 0 &&
      <div className="text-center py-20">
          <Zap className="w-16 h-16 text-primary/30 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold mb-2">Bem-vindo ao FlashStream!</h2>
          <p className="text-muted-foreground">Nenhuma stream disponível de momento.</p>
        </div>
      }
    </div>);

}