const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ShoppingCart, Tag, User, Package, X, Heart, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TOKEN_GIF = "https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/b67743f1e_7208-dragocoin.gif";
const DIAMOND_GIF = "https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/abcabe201_2046-diamond-4.gif";

// currency = "tokens" → vende TOKENS, pede DIAMANTES como pagamento
// currency = "diamonds" → vende DIAMANTES, pede TOKENS como pagamento
export default function PlayerMarketSection({ currency }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [listingType, setListingType] = useState("sell");
  const [form, setForm] = useState({ product_name: "", quantity: "", price_per_unit: "" });
  const [buyingListing, setBuyingListing] = useState(null);

  // What this tab SELLS and what currency it ASKS for
  const isTokenTab = currency === "tokens";
  const sellGif = isTokenTab ? TOKEN_GIF : DIAMOND_GIF;
  const payGif = isTokenTab ? DIAMOND_GIF : TOKEN_GIF;
  const sellLabel = isTokenTab ? "Tokens" : "Diamantes";
  const payLabel = isTokenTab ? "Diamantes" : "Tokens";
  const headerColor = isTokenTab ? "text-yellow-400" : "text-cyan-400";
  const borderColor = isTokenTab ? "border-yellow-400/30" : "border-cyan-400/30";
  const bgColor = isTokenTab ? "bg-yellow-400/5" : "bg-cyan-400/5";

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["player-market", currency],
    queryFn: () => db.entities.PlayerMarket.filter({ currency, status: "active" }, "-created_date", 50),
    refetchInterval: 10000
  });

  // Fetch wallet to check balance before publishing
  const { data: wallet } = useQuery({
    queryKey: ["wallet-market", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const w = await db.entities.Wallet.filter({ user_id: user.id }, "-created_date", 1);
      return w[0] || null;
    },
    enabled: !!user?.id
  });

  const createListing = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Faz login primeiro!");
      const qty = Math.round(Number(form.quantity));
      const price = Math.round(Number(form.price_per_unit));
      if (!form.product_name.trim()) throw new Error("Nome do produto obrigatório!");
      if (qty <= 0 || price <= 0) throw new Error("Quantidade e preço devem ser > 0!");
      // Check balance if selling
      if (listingType === "sell") {
        const balance = isTokenTab ? (wallet?.tokens || 0) : (wallet?.diamonds || 0);
        if (balance < qty) throw new Error(`Saldo insuficiente! Tens ${balance} ${sellLabel} mas queres vender ${qty}.`);
      }
      return db.entities.PlayerMarket.create({
        seller_id: user.id,
        seller_name: user.full_name || "Anónimo",
        currency,
        listing_type: listingType,
        product_name: form.product_name.trim(),
        quantity: qty,
        price_per_unit: price,
        total_price: qty * price,
        status: "active"
      });
    },
    onSuccess: () => {
      toast.success("Anúncio publicado!");
      setShowForm(false);
      setForm({ product_name: "", quantity: "", price_per_unit: "" });
      qc.invalidateQueries({ queryKey: ["player-market", currency] });
    },
    onError: (e) => toast.error(e.message)
  });

  const buyListing = useMutation({
    mutationFn: async (listing) => {
      if (!user?.id) throw new Error("Faz login primeiro!");
      if (listing.seller_id === user.id) throw new Error("Não podes comprar o teu próprio anúncio!");
      // Check buyer has enough pay currency
      const payBalance = isTokenTab ? (wallet?.diamonds || 0) : (wallet?.tokens || 0);
      const cost = listing.price_per_unit;
      if (payBalance < cost) throw new Error(`Saldo insuficiente! Precisas de ${cost} ${payLabel} mas tens ${payBalance}.`);
      // Deduct from buyer
      const buyerWallets = await db.entities.Wallet.filter({ user_id: user.id }, "-created_date", 1);
      if (buyerWallets[0]) {
        const update = isTokenTab
          ? { diamonds: (buyerWallets[0].diamonds || 0) - cost }
          : { tokens: (buyerWallets[0].tokens || 0) - cost };
        await db.entities.Wallet.update(buyerWallets[0].id, update);
      }
      // Credit seller
      const sellerWallets = await db.entities.Wallet.filter({ user_id: listing.seller_id }, "-created_date", 1);
      if (sellerWallets[0]) {
        const credit = isTokenTab
          ? { diamonds: (sellerWallets[0].diamonds || 0) + cost }
          : { tokens: (sellerWallets[0].tokens || 0) + cost };
        await db.entities.Wallet.update(sellerWallets[0].id, credit);
      }
      // Add to buyer inventory
      const buyerWallets2 = await db.entities.Wallet.filter({ user_id: user.id }, "-created_date", 1);
      if (buyerWallets2[0]) {
        const add = isTokenTab
          ? { tokens: (buyerWallets2[0].tokens || 0) + listing.quantity }
          : { diamonds: (buyerWallets2[0].diamonds || 0) + listing.quantity };
        await db.entities.Wallet.update(buyerWallets2[0].id, add);
      }
      // Mark listing as sold
      await db.entities.PlayerMarket.update(listing.id, { status: "sold" });
      // Notify seller
      await db.entities.Notification.create({
        user_id: listing.seller_id, type: "transfer_received",
        title: "🎉 Venda concluída!",
        body: `${user.full_name} comprou o teu anúncio "${listing.product_name}".`,
        from_user_id: user.id, from_username: user.full_name
      });
    },
    onSuccess: () => {
      toast.success("Compra realizada com sucesso!");
      setBuyingListing(null);
      qc.invalidateQueries({ queryKey: ["player-market", currency] });
      qc.invalidateQueries({ queryKey: ["wallet-market"] });
      qc.invalidateQueries({ queryKey: ["wallet-me"] });
      qc.invalidateQueries({ queryKey: ["wallet-navbar"] });
    },
    onError: (e) => toast.error(e.message)
  });

  const cancelListing = useMutation({
    mutationFn: (id) => db.entities.PlayerMarket.update(id, { status: "cancelled" }),
    onSuccess: () => {toast.success("Anúncio removido!");qc.invalidateQueries({ queryKey: ["player-market", currency] });}
  });

  const likeListing = useMutation({
    mutationFn: (l) => {
      const likedBy = l.liked_by || [];
      if (likedBy.includes(user?.id)) return Promise.resolve(); // já deu like
      return db.entities.PlayerMarket.update(l.id, {
        likes: (l.likes || 0) + 1,
        liked_by: [...likedBy, user?.id]
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["player-market", currency] })
  });

  const sells = listings.filter((l) => l.listing_type === "sell");
  const buys = listings.filter((l) => l.listing_type === "buy");

  const payBalance = wallet ? (isTokenTab ? wallet.diamonds : wallet.tokens) : 0;
  const sellBalance = wallet ? (isTokenTab ? wallet.tokens : wallet.diamonds) : 0;

  return (
    <div className={`rounded-2xl border ${borderColor} ${bgColor} p-4 space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <img src="https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/ceb1db69b_coin.jpg" className="w-8 h-8 object-contain" alt={sellLabel} />
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
            <img src={payGif} className="w-8 h-8 object-contain" alt={payLabel} />
          </div>
          <div>
            <p className={`font-display font-bold text-sm ${headerColor}`}>
              Mercado: {sellLabel} ↔ {payLabel}
            </p>
            <p className="text-[10px] text-muted-foreground">{listings.length} anúncios activos</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5" /> Publicar
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm &&
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Novo Anúncio</p>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowForm(false)}><X className="w-3.5 h-3.5" /></Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={listingType === "sell" ? "default" : "secondary"} className="flex-1 gap-1 text-xs" onClick={() => setListingType("sell")}>
                  <Tag className="w-3 h-3" /> Vender {sellLabel}
                </Button>
                <Button size="sm" variant={listingType === "buy" ? "default" : "secondary"} className="flex-1 gap-1 text-xs" onClick={() => setListingType("buy")}>
                  <ShoppingCart className="w-3 h-3" /> Comprar {sellLabel}
                </Button>
              </div>
              <Input
              placeholder={`Nome (ex: Pack 500 ${sellLabel})`}
              value={form.product_name}
              onChange={(e) => setForm((f) => ({ ...f, product_name: e.target.value }))}
              className="text-sm" />
            
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Quantidade de {sellLabel}</p>
                  <Input type="number" min="1" step="1" placeholder="Ex: 500"
                value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} className="text-sm" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Preço em {payLabel}</p>
                  <Input type="number" min="1" step="1" placeholder="Ex: 10"
                value={form.price_per_unit} onChange={(e) => setForm((f) => ({ ...f, price_per_unit: e.target.value }))} className="text-sm" />
                </div>
              </div>
              {form.quantity && form.price_per_unit &&
            <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg text-xs">
                  <img src={sellGif} className="w-5 h-5 object-contain" alt="" />
                  <span className="font-bold">{Math.round(Number(form.quantity))} {sellLabel}</span>
                  <span className="text-muted-foreground">por</span>
                  <img src={payGif} className="w-5 h-5 object-contain" alt="" />
                  <span className="font-bold">{Math.round(Number(form.price_per_unit))} {payLabel}</span>
                </div>
            }
              <Button className="w-full text-sm" onClick={() => createListing.mutate()} disabled={createListing.isPending}>
                {createListing.isPending ? "A publicar..." : "Publicar Anúncio"}
              </Button>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Balance info */}
      {user && (
        <div className="flex gap-3 text-xs">
          <span className={`flex items-center gap-1 ${headerColor}`}>
            <img src={sellGif} className="w-4 h-4 object-contain" alt="" />
            {sellBalance.toLocaleString()} {sellLabel}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <img src={payGif} className="w-4 h-4 object-contain" alt="" />
            {payBalance.toLocaleString()} {payLabel}
          </span>
        </div>
      )}

      {/* Listings grid */}
      {isLoading ?
      <div className="flex justify-center py-4"><div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div> :

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ListingsColumn
          title={`À Venda — ${sellLabel}`} listings={sells} type="sell"
          sellGif={sellGif} payGif={payGif} sellLabel={sellLabel} payLabel={payLabel}
          userId={user?.id} onCancel={(id) => cancelListing.mutate(id)} onLike={(l) => likeListing.mutate(l)}
          onBuy={(l) => setBuyingListing(l)} />
        
          <ListingsColumn
          title={`À Procura — ${sellLabel}`} listings={buys} type="buy"
          sellGif={sellGif} payGif={payGif} sellLabel={sellLabel} payLabel={payLabel}
          userId={user?.id} onCancel={(id) => cancelListing.mutate(id)} onLike={(l) => likeListing.mutate(l)}
          onBuy={(l) => setBuyingListing(l)} />
        
        </div>
      }

      {/* Buy Confirmation Dialog */}
      <Dialog open={!!buyingListing} onOpenChange={() => setBuyingListing(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" /> Confirmar Compra
            </DialogTitle>
          </DialogHeader>
          {buyingListing && (
            <div className="space-y-4">
              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <p className="font-bold">{buyingListing.product_name}</p>
                <p className="text-sm text-muted-foreground">Vendedor: {buyingListing.seller_name}</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-1">
                    <img src={sellGif} className="w-6 h-6 object-contain" alt="" />
                    <span className="font-bold text-sm">{buyingListing.quantity} {sellLabel}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">por</span>
                  <div className="flex items-center gap-1">
                    <img src={payGif} className="w-6 h-6 object-contain" alt="" />
                    <span className="font-bold text-sm">{buyingListing.price_per_unit} {payLabel}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Tens {payBalance} {payLabel}. Esta compra custa {buyingListing.price_per_unit} {payLabel}.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setBuyingListing(null)}>Cancelar</Button>
                <Button className="flex-1 gap-2" onClick={() => buyListing.mutate(buyingListing)} disabled={buyListing.isPending || payBalance < buyingListing.price_per_unit}>
                  {buyListing.isPending ? "..." : "Comprar"}
                </Button>
              </div>
              {payBalance < buyingListing.price_per_unit && (
                <p className="text-xs text-destructive text-center">Saldo insuficiente!</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>);

}

function ListingsColumn({ title, listings, type, sellGif, payGif, sellLabel, payLabel, userId, onCancel, onLike, onBuy }) {
  const color = type === "sell" ? "text-green-400" : "text-blue-400";
  const border = type === "sell" ? "border-green-400/20" : "border-blue-400/20";
  return (
    <div className="space-y-2">
      <p className={`text-xs font-bold ${color} flex items-center gap-1`}>
        {type === "sell" ? <Tag className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
        {title} ({listings.length})
      </p>
      {listings.length === 0 ?
      <div className="text-center py-4 text-muted-foreground text-xs border border-border rounded-xl">Sem anúncios</div> :

      listings.map((l, i) =>
      <motion.div key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
            <Card className={`border ${border}`}>
              <CardContent className="p-3 flex items-center gap-2">
                {/* Sell currency */}
                <div className="text-center flex-shrink-0">
                  <img src="https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/ceb1db69b_coin.jpg" className="w-8 h-8 object-contain mx-auto" alt="" />
                  <p className="text-[10px] font-bold text-foreground mt-0.5">{Math.round(l.quantity)}</p>
                </div>
                <div className="text-muted-foreground text-xs">↔</div>
                {/* Pay currency */}
                <div className="text-center flex-shrink-0">
                  <img src={payGif} className="w-8 h-8 object-contain mx-auto" alt="" />
                  <p className="text-[10px] font-bold text-foreground mt-0.5">{Math.round(l.price_per_unit)}</p>
                  <p className="text-[9px] text-muted-foreground">{payLabel}</p>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0 ml-1">
                  <p className="text-xs font-semibold truncate">{l.product_name}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <User className="w-2.5 h-2.5" />{l.seller_name}
                  </p>
                </div>
                {/* Like + Cancel */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  {(() => {
                    const hasLiked = (l.liked_by || []).includes(userId);
                    return (
                      <button
                        onClick={() => !hasLiked && onLike(l)}
                        className={`flex items-center gap-0.5 text-[10px] transition-colors ${hasLiked ? "text-pink-500 cursor-default" : "text-muted-foreground hover:text-pink-400 cursor-pointer"}`}
                        title={hasLiked ? "Já deste like" : "Dar like"}
                      >
                        <Heart className={`w-3 h-3 ${hasLiked ? "fill-pink-500 text-pink-500" : ""}`} />{l.likes || 0}
                      </button>
                    );
                  })()}
                  {userId === l.seller_id ? (
                    <button onClick={() => onCancel(l.id)} className="text-destructive hover:text-destructive/80">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : type === "sell" ? (
                    <button onClick={() => onBuy(l)} className="text-[10px] text-primary font-bold hover:underline">
                      Comprar
                    </button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </motion.div>
      )
      }
    </div>);

}