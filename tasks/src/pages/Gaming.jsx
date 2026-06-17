import React, { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Gamepad2, Star, TrendingUp, Tag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PLATFORMS = [
  {
    key: "xbox",
    label: "Xbox / Game Pass",
    color: "from-green-600 to-green-800",
    accent: "#107C10",
    glow: "rgba(16,124,16,0.4)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Xbox_one_logo.svg/120px-Xbox_one_logo.svg.png",
    storeUrl: "https://www.xbox.com/pt-PT/games/store",
    passUrl: "https://www.xbox.com/pt-PT/xbox-game-pass",
    description: "Game Pass Ultimate, jogos Xbox & PC",
    badge: "Game Pass",
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  {
    key: "steam",
    label: "Steam",
    color: "from-blue-700 to-slate-800",
    accent: "#1b2838",
    glow: "rgba(27,40,56,0.8)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/120px-Steam_icon_logo.svg.png",
    storeUrl: "https://store.steampowered.com/",
    passUrl: "https://store.steampowered.com/sale/steamsales",
    description: "A maior loja de jogos para PC",
    badge: "PC Gaming",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
];

const XBOX_FEATURED = [
  { title: "Halo Infinite", genre: "FPS", img: "https://store-images.s-microsoft.com/image/apps.36897.13857936920161965.3b17e0b2-6e6a-4a61-825c-4ebebd2c793e.59b2e690-e4f4-11e9-8a7a-000d3a23e53b", price: "Game Pass", url: "https://www.xbox.com/pt-PT/games/store/halo-infinite-campaign/9NP6S3GQDTMR", tag: "🎮 FPS" },
  { title: "Forza Horizon 5", genre: "Racing", img: "https://store-images.s-microsoft.com/image/apps.40953.13937825041461000.5ae12bc3-8fd3-4875-b3eb-0c3e073b6eaa.7c39f3e5-bc7f-4977-8d48-f43f3a3b6f20", price: "Game Pass", url: "https://www.xbox.com/pt-PT/games/store/forza-horizon-5/9NKX70BBCDRN", tag: "🏎️ Racing" },
  { title: "Sea of Thieves", genre: "Adventure", img: "https://store-images.s-microsoft.com/image/apps.53167.13537572680981698.f25ecd55-3777-4d55-89be-4ec30e3de9dc.17db2b38-e6b3-4d2d-bec0-cd82f68bc5a4", price: "Game Pass", url: "https://www.xbox.com/pt-PT/games/store/sea-of-thieves/9P86S9NTSKDW", tag: "⚓ Adventure" },
  { title: "Minecraft", genre: "Sandbox", img: "https://store-images.s-microsoft.com/image/apps.26842.13510798882677226.9d1b6c2a-7f6a-4c8b-b18a-44d29d67b9e4.b3aa4a82-3c1c-4574-9e10-35e25d3e4de8", price: "Game Pass", url: "https://www.xbox.com/pt-PT/games/store/minecraft-java-bedrock-edition-for-pc/9NXP44L49SHJ", tag: "🌍 Sandbox" },
  { title: "Starfield", genre: "RPG", img: "https://store-images.s-microsoft.com/image/apps.54872.14422457297610716.2c1be459-0d07-49cd-9f6b-1a8f4c04aa4d.00f5cfba-cfae-4e09-9fde-63bce2e8a40b", price: "Game Pass", url: "https://www.xbox.com/pt-PT/games/starfield", tag: "🚀 RPG" },
  { title: "Diablo IV", genre: "Action RPG", img: "https://store-images.s-microsoft.com/image/apps.48762.13921474897029004.5b50e1dd-ab1e-43a0-b6c3-7b76cfcb1bd0.e23da16b-8c00-457c-87b0-8fcce578e7ba", price: "€69.99", url: "https://www.xbox.com/pt-PT/games/diablo-iv", tag: "⚔️ ARPG" },
];

const STEAM_FEATURED = [
  { title: "Counter-Strike 2", genre: "FPS", img: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg", price: "Free", url: "https://store.steampowered.com/app/730/CounterStrike_2/", tag: "🎯 FPS" },
  { title: "Dota 2", genre: "MOBA", img: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg", price: "Free", url: "https://store.steampowered.com/app/570/Dota_2/", tag: "🗡️ MOBA" },
  { title: "Elden Ring", genre: "Action RPG", img: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", price: "€59.99", url: "https://store.steampowered.com/app/1245620/ELDEN_RING/", tag: "🔥 ARPG" },
  { title: "Cyberpunk 2077", genre: "RPG", img: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg", price: "€59.99", url: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/", tag: "🤖 RPG" },
  { title: "GTA V", genre: "Action", img: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg", price: "€29.99", url: "https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/", tag: "🚗 Action" },
  { title: "Baldur's Gate 3", genre: "RPG", img: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg", price: "€59.99", url: "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/", tag: "🎲 RPG" },
];

function GameCard({ game, accentColor, index }) {
  return (
    <motion.a
      href={game.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:scale-[1.02] block"
    >
      <div className="aspect-video relative overflow-hidden bg-secondary">
        <img
          src={game.img}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={e => { e.target.style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <Badge className="absolute top-2 left-2 text-[10px] bg-black/60 border-white/20 text-white">
          {game.tag}
        </Badge>
        <div className="absolute bottom-2 right-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            game.price === "Free" || game.price === "Game Pass"
              ? "bg-green-500/90 text-white"
              : "bg-primary/90 text-white"
          }`}>
            {game.price}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{game.title}</p>
        <p className="text-xs text-muted-foreground">{game.genre}</p>
      </div>
    </motion.a>
  );
}

export default function Gaming() {
  const [activePlatform, setActivePlatform] = useState("all");

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 border border-primary/20 mb-2">
          <Gamepad2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Gaming Hub</span>
        </div>
        <h1 className="text-3xl font-display font-bold">Jogos & Plataformas</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Acede diretamente às lojas Xbox e Steam. Descobre jogos, promoções e Game Pass.
        </p>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => (
          <motion.div
            key={platform.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden border border-border group"
            style={{ boxShadow: `0 0 30px ${platform.glow}` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-20`} />
            <div className="relative p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center flex-shrink-0 overflow-hidden p-2">
                <img src={platform.logo} alt={platform.label} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-xl font-display font-bold">{platform.label}</h2>
                  <Badge className={`text-[10px] border ${platform.badgeColor}`}>{platform.badge}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{platform.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <a href={platform.storeUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-1.5 h-7 text-xs">
                      <ExternalLink className="w-3 h-3" /> Ver Loja
                    </Button>
                  </a>
                  <a href={platform.passUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="secondary" className="gap-1.5 h-7 text-xs">
                      <Star className="w-3 h-3" /> {platform.key === "xbox" ? "Game Pass" : "Promoções"}
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {[
          { key: "all", label: "🎮 Todos" },
          { key: "xbox", label: "🟢 Xbox" },
          { key: "steam", label: "🔵 Steam" },
        ].map(f => (
          <Button
            key={f.key}
            size="sm"
            variant={activePlatform === f.key ? "default" : "secondary"}
            onClick={() => setActivePlatform(f.key)}
            className="flex-shrink-0"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Xbox Games */}
      {(activePlatform === "all" || activePlatform === "xbox") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              Xbox & Game Pass
            </h2>
            <a href="https://www.xbox.com/pt-PT/games/store" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-green-400 hover:text-green-300">
                Ver tudo <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {XBOX_FEATURED.map((game, i) => (
              <GameCard key={game.title} game={game} index={i} />
            ))}
          </div>
          {/* Game Pass CTA */}
          <motion.a
            href="https://www.xbox.com/pt-PT/xbox-game-pass"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden border border-green-500/30 hover:border-green-500/60 transition-all group"
            whileHover={{ scale: 1.01 }}
          >
            <div className="bg-gradient-to-r from-green-900/50 to-green-700/20 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-green-400">Xbox Game Pass Ultimate</p>
                  <p className="text-sm text-muted-foreground">+100 jogos incluídos • Console + PC + Cloud</p>
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-500 gap-2 flex-shrink-0">
                <ExternalLink className="w-4 h-4" /> Subscrever
              </Button>
            </div>
          </motion.a>
        </div>
      )}

      {/* Steam Games */}
      {(activePlatform === "all" || activePlatform === "steam") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              Steam PC
            </h2>
            <a href="https://store.steampowered.com/" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-blue-400 hover:text-blue-300">
                Ver tudo <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STEAM_FEATURED.map((game, i) => (
              <GameCard key={game.title} game={game} index={i} />
            ))}
          </div>
          {/* Steam Sales CTA */}
          <motion.a
            href="https://store.steampowered.com/sale/steamsales"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden border border-blue-500/30 hover:border-blue-500/60 transition-all group"
            whileHover={{ scale: 1.01 }}
          >
            <div className="bg-gradient-to-r from-blue-900/50 to-slate-800/50 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-blue-400">Steam Sales & Promoções</p>
                  <p className="text-sm text-muted-foreground">Descontos de até 90% nos melhores jogos PC</p>
                </div>
              </div>
              <Button className="bg-blue-700 hover:bg-blue-600 gap-2 flex-shrink-0">
                <TrendingUp className="w-4 h-4" /> Ver Promoções
              </Button>
            </div>
          </motion.a>
        </div>
      )}
    </div>
  );
}