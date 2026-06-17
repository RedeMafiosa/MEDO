const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingBag, Coins, Diamond, Gem, Crown, Sparkles, Star, Zap, TrendingUp, Info, Send, ArrowDownUp } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import VipSection from "@/components/store/VipSection";
import PlayerMarketSection from "@/components/store/PlayerMarketSection";
import StorePaymentModal from "@/components/store/StorePaymentModal";

const TOKEN_GIF = "https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/b67743f1e_7208-dragocoin.gif";
const DIAMOND_GIF = "https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/abcabe201_2046-diamond-4.gif";
const POTION_GIF = "https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/1f92ffbb0_32528-potion.gif";

const categoryIcons = {
  tokens: Coins, diamonds: Diamond, gems: Gem, vip: Crown,
  emotes: Sparkles, badges: Star, themes: Zap
};
const categoryLabels = {
  tokens: "Tokens", diamonds: "Diamantes", gems: "Poções",
  vip: "VIP", emotes: "Emotes", badges: "Badges", themes: "Themes"
};

const DEFAULT_BADGES = [
{ id: "b1", name: "🏆 Campeão", description: "Para os melhores jogadores", image: "", rarity: "legendary", price: 4.99 },
{ id: "b2", name: "⭐ Estrela", description: "Utilizador estrela", image: "", rarity: "epic", price: 2.99 },
{ id: "b3", name: "🔥 Em Chamas", description: "Está literalmente em chamas!", image: "", rarity: "rare", price: 1.99 },
{ id: "b4", name: "💎 Diamante", description: "Premium desde o início", image: "", rarity: "legendary", price: 9.99 },
{ id: "b5", name: "👑 Rei", description: "O rei da plataforma", image: "", rarity: "legendary", price: 14.99 },
{ id: "b6", name: "🎮 Gamer", description: "Verdadeiro gamer de coração", image: "", rarity: "common", price: 0.99 },
{ id: "b7", name: "🚀 Foguete", description: "Vai além dos limites!", image: "", rarity: "epic", price: 3.99 },
{ id: "b8", name: "🎭 Artista", description: "Criativo e único", image: "", rarity: "rare", price: 2.49 },
{ id: "b9", name: "🌈 Arco-íris", description: "Colorido e vibrante", image: "", rarity: "rare", price: 1.49 },
{ id: "b10", name: "⚡ Relâmpago", description: "Rápido como o relâmpago", image: "", rarity: "epic", price: 3.49 }];

const RARITY_STYLE = {
  common: { label: "Comum", color: "text-gray-400", border: "border-gray-400/30" },
  rare: { label: "Raro", color: "text-blue-400", border: "border-blue-400/40" },
  epic: { label: "Épico", color: "text-purple-400", border: "border-purple-400/50" },
  legendary: { label: "Lendário", color: "text-yellow-400", border: "border-yellow-400/60", glow: true }
};

const POTION_EMOTES = [
{ id: "e1", name: "HealthPotion", img: "https://cdn3.emoji.gg/emojis/442472-healthpotion.png" },
{ id: "e2", name: "PinkGothPotion", img: "https://cdn3.emoji.gg/emojis/90238-pinkgothpotionbottle.png" },
{ id: "e3", name: "Potion", img: "https://cdn3.emoji.gg/emojis/32528-potion.gif" },
{ id: "e4", name: "DarkPotion", img: "https://cdn3.emoji.gg/emojis/44332-darkpotion.gif" },
{ id: "e5", name: "BluePotion", img: "https://cdn3.emoji.gg/emojis/99270-bluepotion.gif" },
{ id: "e6", name: "Black Potion", img: "https://cdn3.emoji.gg/emojis/231998-black-potion.png" },
{ id: "e7", name: "Pink Love Potion", img: "https://cdn3.emoji.gg/emojis/56325-pink-love-potion.png" },
{ id: "e8", name: "Potion Pixel", img: "https://cdn3.emoji.gg/emojis/38066-potion.png" },
{ id: "e9", name: "RedChristmasPotion", img: "https://cdn3.emoji.gg/emojis/560332-redchristmaspotion.png" },
{ id: "e10", name: "GreenChristmasPotion", img: "https://cdn3.emoji.gg/emojis/474392-greenchristmaspotion.png" },
{ id: "e11", name: "Lab Potion", img: "https://cdn3.emoji.gg/emojis/43528-lab.png" },
{ id: "e12", name: "Love Potion", img: "https://cdn3.emoji.gg/emojis/39286-love-potion.png" }];

const TABS = [
{ key: "tokens", label: "Tokens", icon: Coins },
{ key: "diamonds", label: "Diamantes", icon: Diamond },
{ key: "gems", label: "Poções", icon: Gem },
{ key: "vip", label: "VIP", icon: Crown },
{ key: "emotes", label: "Emotes", icon: Sparkles },
{ key: "badges", label: "Badges", icon: Star }];

export default function Store() {
  const { user } = useAuth();
  const [tab, setTab] = useState("tokens");
  const [detailItem, setDetailItem] = useState(null);
  const [payItem, setPayItem] = useState(null);
  const [payItemGif, setPayItemGif] = useState(null);
  const [sendTarget, setSendTarget] = useState("");
  const [showSendBadge, setShowSendBadge] = useState(false);
  const qc = useQueryClient();

  const openPayment = (item, gif) => {setPayItem(item);setPayItemGif(gif);};

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["store-items"],
    queryFn: () => db.entities.StoreItem.list("-is_popular", 50)
  });

  const { data: wallet } = useQuery({
    queryKey: ["wallet-me", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const w = await db.entities.Wallet.filter({ user_id: user.id }, "-created_date", 1);
      return w[0] || null;
    },
    enabled: !!user?.id,
    staleTime: 0
  });

  const buyBadge = useMutation({
    mutationFn: async (badge) => {
      if (!user?.id) throw new Error("Faz login primeiro!");
      await db.entities.Inventory.create({
        owner_id: user.id, owner_username: user.full_name,
        item_type: "badge", item_name: badge.name,
        item_description: badge.description, item_image: badge.image,
        item_rarity: badge.rarity, quantity: 1
      });
    },
    onSuccess: (_, badge) => {toast.success(`${badge.name} adicionado ao inventário!`);setDetailItem(null);},
    onError: (e) => toast.error(e.message)
  });

  const sendBadge = useMutation({
    mutationFn: async ({ badge, target }) => {
      let targets = await db.entities.UserProfile.filter({ username: target }, "-created_date", 1);
      if (!targets.length) targets = await db.entities.UserProfile.filter({ user_id: target }, "-created_date", 1);
      if (!targets.length) throw new Error("Utilizador não encontrado!");
      const t = targets[0];
      await db.entities.Inventory.create({
        owner_id: t.user_id, owner_username: t.username,
        item_type: "badge", item_name: badge.name,
        item_description: badge.description, item_image: badge.image,
        item_rarity: badge.rarity, quantity: 1
      });
      await db.entities.Notification.create({
        user_id: t.user_id, type: "badge_received",
        title: "🏅 Badge Recebido!",
        body: `${user.full_name} enviou-te o badge ${badge.name}`,
        from_user_id: user.id, from_username: user.full_name,
        data: { badge_name: badge.name }
      });
      return t;
    },
    onSuccess: (t, { badge }) => {
      toast.success(`${badge.name} enviado para ${t.username}!`);
      setShowSendBadge(false);setDetailItem(null);setSendTarget("");
    },
    onError: (e) => toast.error(e.message)
  });

  // Only items matching current tab category
  const tabItems = items.filter((i) => {
    if (tab === "gems") return i.category === "gems";
    return i.category === tab;
  });

  const getCategoryGif = (cat) => {
    if (cat === "diamonds") return DIAMOND_GIF;
    if (cat === "gems") return POTION_GIF;
    return TOKEN_GIF;
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" /> Loja
        </h1>
        <p className="text-muted-foreground mt-1 [font-family:'Orbitron',_sans-serif] text-xl">Seus tokens</p>
      </div>

      {/* Wallet Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
        { key: "tokens", label: "Tokens", color: "text-yellow-400", value: wallet?.tokens || 0, gif: TOKEN_GIF },
        { key: "diamonds", label: "Diamantes", color: "text-cyan-400", value: wallet?.diamonds || 0, gif: DIAMOND_GIF },
        { key: "gems", label: "Poções", color: "text-pink-400", value: wallet?.gems || 0, gif: POTION_GIF }].
        map((item) =>
        <div
          key={item.key}
          className="relative rounded-xl border border-border overflow-hidden group cursor-pointer"
          onClick={() => window.location.href = "/wallet"}>
          
            <div className="relative p-3 flex items-center gap-3 bg-card/80 backdrop-blur-sm">
              <img src="https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/ceb1db69b_coin.jpg" alt="" className="w-9 h-9 object-contain flex-shrink-0" />
              <div>
                <p className="text-base text-[hsl(var(--chart-4))]">{item.label}</p>
                <p className={`text-base font-bold ${item.color}`}>{item.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MERCADO DE JOGADORES (top, only for tokens + diamonds tabs) ── */}
      {(tab === "tokens" || tab === "diamonds") &&
      <div className="space-y-2">
          <h2 className="font-display font-bold text-sm flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-primary" />
            Mercado de Jogadores
          </h2>
          <PlayerMarketSection currency={tab} />
        </div>
      }

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map(({ key, label, icon: Icon }) =>
        <Button key={key} variant={tab === key ? "default" : "secondary"} size="sm"
        className="flex-shrink-0 gap-1.5" onClick={() => setTab(key)}>
            <Icon className="w-3.5 h-3.5" />{label}
          </Button>
        )}
      </div>

      {/* ── TOKENS TAB ── */}
      {tab === "tokens" &&
      <div className="space-y-3">
          <h2 className="font-display font-bold flex items-center gap-2">
            <img src={TOKEN_GIF} alt="" className="w-6 h-6 object-contain" /> Comprar Tokens
          </h2>
          {isLoading ? <LoadingSpinner /> : tabItems.length === 0 ?
        <p className="text-sm text-muted-foreground text-center py-6">Nenhum produto de tokens disponível.</p> :

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {tabItems.map((item, i) =>
          <StoreItemCard key={item.id} item={item} index={i} gif={item.image_url || TOKEN_GIF} onClick={() => setDetailItem(item)} onBuy={() => openPayment(item, item.image_url || TOKEN_GIF)} />
          )}
            </div>
        }
        </div>
      }

      {/* ── DIAMONDS TAB ── */}
      {tab === "diamonds" &&
      <div className="space-y-3">
          <h2 className="font-display font-bold flex items-center gap-2">
            <img src={DIAMOND_GIF} alt="" className="w-6 h-6 object-contain" /> Comprar Diamantes
          </h2>
          {isLoading ? <LoadingSpinner /> : tabItems.length === 0 ?
        <p className="text-sm text-muted-foreground text-center py-6">Nenhum produto de diamantes disponível.</p> :

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {tabItems.map((item, i) =>
          <StoreItemCard key={item.id} item={item} index={i} gif={item.image_url || DIAMOND_GIF} onClick={() => setDetailItem(item)} onBuy={() => openPayment(item, item.image_url || DIAMOND_GIF)} />
          )}
            </div>
        }
        </div>
      }

      {/* ── POÇÕES TAB ── */}
      {tab === "gems" &&
      <div className="space-y-3">
          <h2 className="font-display font-bold flex items-center gap-2">
            <img src={POTION_GIF} alt="" className="w-6 h-6 object-contain" /> Comprar Poções
          </h2>
          {isLoading ? <LoadingSpinner /> : tabItems.length === 0 ?
        <p className="text-sm text-muted-foreground text-center py-6">Nenhum produto de poções disponível.</p> :

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {tabItems.map((item, i) =>
          <StoreItemCard key={item.id} item={item} index={i} gif={item.image_url || POTION_GIF} onClick={() => setDetailItem(item)} onBuy={() => openPayment(item, item.image_url || POTION_GIF)} />
          )}
            </div>
        }
        </div>
      }

      {/* ── VIP TAB ── */}
      {tab === "vip" &&
      <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 border border-primary/20">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-primary">Planos VIP</span>
            </div>
            <h2 className="font-display font-bold text-3xl">Eleva a tua experiência</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Desbloqueia funcionalidades exclusivas, badges únicos e muito mais.</p>
          </div>
          <VipSection />
        </div>
      }

      {/* ── EMOTES TAB ── */}
      {tab === "emotes" &&
      <div className="space-y-4">
          <div className="p-3 bg-pink-400/10 border border-pink-400/20 rounded-xl text-xs text-pink-300">
            🧪 <strong>Emotes de Poção</strong> — emotes da comunidade para usar no chat!
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {POTION_EMOTES.map((e, i) =>
          <motion.div key={e.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border hover:border-primary/40 transition-all group cursor-pointer" onClick={() => toast.info(`Emote: ${e.name}`)}>
                  <CardContent className="p-3 text-center">
                    <div className="aspect-square rounded-lg overflow-hidden bg-secondary mb-2 flex items-center justify-center">
                      <img src={e.img} alt={e.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                  onError={(ev) => {ev.target.style.display = "none";}} />
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{e.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
          )}
          </div>
        </div>
      }

      {/* ── BADGES TAB ── */}
      {tab === "badges" &&
      <div className="space-y-3">
          <div className="p-3 bg-blue-400/5 border border-blue-400/20 rounded-xl text-xs text-blue-300">
            💡 <strong>Como funciona:</strong> Compra um badge → vai para o teu Inventário → podes enviá-lo a outros jogadores!
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {DEFAULT_BADGES.map((badge, i) => {
            const rarity = RARITY_STYLE[badge.rarity] || RARITY_STYLE.common;
            return (
              <motion.div key={badge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card
                  className={`border ${rarity.border} overflow-hidden hover:scale-105 cursor-pointer transition-all ${rarity.glow ? "shadow-lg shadow-yellow-400/20" : ""}`}
                  onClick={() => setDetailItem(badge)}>
                  
                    <CardContent className="p-3 text-center">
                      <div className="aspect-square rounded-xl flex items-center justify-center mb-2 bg-secondary text-4xl">
                        {badge.name.split(" ")[0]}
                      </div>
                      <p className="text-xs font-bold truncate">{badge.name.slice(badge.name.indexOf(" ") + 1)}</p>
                      <p className={`text-[10px] ${rarity.color} font-medium`}>{rarity.label}</p>
                      <p className="text-sm font-bold text-primary mt-1">€{badge.price.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </motion.div>);

          })}
          </div>
        </div>
      }

      {/* Store Payment Modal */}
      <StorePaymentModal item={payItem} itemGif={payItemGif} onClose={() => {setPayItem(null);setPayItemGif(null);}} />

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={() => {setDetailItem(null);setShowSendBadge(false);setSendTarget("");}}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> Detalhes do Item
            </DialogTitle>
          </DialogHeader>
          {detailItem &&
          <div className="space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
                {detailItem.image_url ?
              <img src={detailItem.image_url} alt={detailItem.name} className="w-full h-full object-cover" /> :
              detailItem.image ?
              <img src={detailItem.image} alt={detailItem.name} className="w-full h-full object-cover" /> :
              detailItem.category ?
              <img src={getCategoryGif(detailItem.category)} alt="" className="w-24 h-24 object-contain" /> :

              <div className="text-6xl">{(detailItem.name || "").split(" ")[0]}</div>
              }
              </div>
              <div>
                <h3 className="text-lg font-bold">{detailItem.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{detailItem.description}</p>
                {detailItem.rarity &&
              <Badge className={`mt-2 ${RARITY_STYLE[detailItem.rarity]?.color} bg-transparent border`}>
                    {RARITY_STYLE[detailItem.rarity]?.label}
                  </Badge>
              }
              </div>
              {detailItem.amount > 0 &&
            <div className="bg-secondary rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{detailItem.amount?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{categoryLabels[detailItem.category] || "Quantidade"}</p>
                  {detailItem.bonus_amount > 0 && <p className="text-green-400 text-sm">+{detailItem.bonus_amount} bónus!</p>}
                </div>
            }
              <div className="flex items-center justify-between bg-secondary rounded-lg p-3">
                <span className="text-sm text-muted-foreground">Preço</span>
                <span className="text-xl font-bold text-primary">€{(detailItem.price_eur || detailItem.price || 0).toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                {detailItem.rarity &&
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setShowSendBadge((s) => !s)}>
                    <Send className="w-4 h-4" /> Enviar
                  </Button>
              }
                <Button className="flex-1 gap-2" onClick={() => {
                if (detailItem.rarity) {buyBadge.mutate(detailItem);} else
                {openPayment(detailItem, getCategoryGif(detailItem.category));setDetailItem(null);}
              }} disabled={buyBadge.isPending}>
                  <ShoppingBag className="w-4 h-4" />
                  {buyBadge.isPending ? "..." : "Comprar"}
                </Button>
              </div>
              {showSendBadge &&
            <div className="space-y-2 border-t border-border pt-3">
                  <Input value={sendTarget} onChange={(e) => setSendTarget(e.target.value)} placeholder="Nome ou ID do jogador..." />
                  <Button className="w-full gap-2" disabled={!sendTarget.trim() || sendBadge.isPending}
              onClick={() => sendBadge.mutate({ badge: detailItem, target: sendTarget.trim() })}>
                    <Send className="w-4 h-4" />
                    {sendBadge.isPending ? "Enviando..." : "Enviar Badge"}
                  </Button>
                </div>
            }
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>);

}

function StoreItemCard({ item, index, gif, onClick, onBuy }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="border-border hover:border-primary/40 transition-all group overflow-hidden relative cursor-pointer" onClick={onClick}>
        {item.is_popular &&
        <Badge className="absolute top-2 right-2 bg-primary text-xs z-10">
            <TrendingUp className="w-3 h-3 mr-1" />Popular
          </Badge>
        }
        {item.discount_percent > 0 &&
        <Badge className="absolute top-2 left-2 bg-destructive text-xs z-10">-{item.discount_percent}%</Badge>
        }
        <CardContent className="p-4 text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 group-hover:scale-110 transition-transform flex items-center justify-center bg-secondary">
            <img src={gif} alt={item.name} className="w-full h-full object-contain" />
          </div>
          <h3 className="font-bold text-sm mb-1">{item.name}</h3>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
          {item.amount > 0 &&
          <div className="mb-1">
              <span className="text-xl font-display font-bold">{item.amount?.toLocaleString()}</span>
              {item.bonus_amount > 0 && <span className="text-xs text-green-400 ml-1">+{item.bonus_amount}</span>}
            </div>
          }
          <span className="text-lg font-bold text-primary">€{item.price_eur?.toFixed(2)}</span>
          <Button
            className="w-full gap-1 mt-3 h-8 text-xs"
            onClick={(e) => {e.stopPropagation();onBuy && onBuy();}}>
            
            <ShoppingBag className="w-3 h-3" />Comprar
          </Button>
        </CardContent>
      </Card>
    </motion.div>);
}

function LoadingSpinner() {
  return <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
}