import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Radio, ShoppingBag, Wallet, Crown, Trophy, HelpCircle,
  Gamepad2, Rss, Hash, MessageSquare, Gavel, Shield, Users,
  Zap, Star } from
"lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

const categories = [
{ icon: Gamepad2, label: "🎮 Gaming", path: "/gaming" },
{ icon: Zap, label: "⚡ Flashgame", path: "/flashgame" },
{ icon: Rss, label: "📰 Feed", path: "/feed" },
{ icon: Hash, label: "🏠 Salas", path: "/rooms" },
{ icon: MessageSquare, label: "💬 Chat Geral", path: "/chat" },
{ icon: Gavel, label: "📜 Regras", path: "/rules" },
{ icon: Shield, label: "🔒 Privacidade", path: "/privacy" }];

const menuItems = [
{ icon: Home, label: "🏠 Início", path: "/" },
{ icon: Radio, label: "📡 Streams", path: "/streams", live: true },
{ icon: ShoppingBag, label: "🛒 Loja", path: "/store" },
{ icon: Wallet, label: "💳 Carteira", path: "/wallet" },
{ icon: Crown, label: "👑 VIP", path: "/vip" },
{ icon: Trophy, label: "🏆 Ranking", path: "/ranking" },
{ icon: HelpCircle, label: "🆘 Suporte", path: "/support" },
{ icon: Star, label: "📦 Inventário", path: "/inventory" }];

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.search === `?cat=${path.split("=")[1]}`;
  };

  return (
    <AnimatePresence>
      {isOpen &&
      <motion.aside
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 230, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed left-0 top-14 bottom-0 z-40 bg-card border-r border-border overflow-hidden">
        
          <div className="flex flex-col h-full p-3 overflow-y-auto">
            {/* Menu principal */}
            <div className="space-y-0.5">
              {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all [font-family:'Space_Grotesk',_sans-serif] ${
                  active ?
                  "bg-primary/15 text-primary" :
                  "text-muted-foreground hover:text-foreground hover:bg-secondary"}`
                  }>
                  
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-base font-bold capitalize [font-family:'Orbitron',_sans-serif] italic opacity-100 underline">{item.label}</span>
                    {item.live &&
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-live-pulse" />
                  }
                  </Link>);

            })}
            </div>

            {/* Separator */}
            <div className="my-4 border-t border-border" />

            {/* Comunidade */}
            <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-2 text-[hsl(var(--primary))] [font-family:'Literata',_serif]">COMUNIDADE

          </p>
            <div className="space-y-0.5">
              {categories.map((cat) => {
              const active = location.pathname === cat.path || cat.path.includes("?") && location.pathname + location.search === cat.path;
              return (
                <Link
                  key={cat.path}
                  to={cat.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors [font-family:'Lilita_One',_system-ui] ${
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`
                  }>
                  
                    <cat.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-bold text-base [font-family:'Orbitron',_sans-serif] italic underline">{cat.label}</span>
                  </Link>);

            })}
            </div>

            {/* Separator */}
            <div className="my-4 border-t border-border" />

            {/* Recomendados */}
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Recomendados
            </p>
            <div className="space-y-1">
              {["ProGamer99", "MusicLive", "ArtCreator"].map((name, i) =>
            <div key={name} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-purple-800 flex items-center justify-center text-[10px] font-bold">
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{name}</p>
                    <p className="text-[10px] text-muted-foreground">Gaming</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-live-pulse" />
                    <span className="text-[10px] text-muted-foreground">{(i + 1) * 234}</span>
                  </div>
                </div>
            )}
            </div>

            {/* Admin Button — só para admins */}
            {isAdmin && (
              <>
                <div className="my-4 border-t border-border" />
                <Link
                  to="/admin"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-bold transition-all bg-red-600/15 text-red-500 hover:bg-red-600/25 hover:text-red-400"
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span className="text-base font-bold [font-family:'Orbitron',_sans-serif] italic underline">🛡️ Painel Admin</span>
                </Link>
              </>
            )}

            {/* Footer */}
            <div className="mt-auto pt-4 px-3">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">1.2K online</span>
              </div>
            </div>
          </div>
        </motion.aside>
      }
    </AnimatePresence>);

}