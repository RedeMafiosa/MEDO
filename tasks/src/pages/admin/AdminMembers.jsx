const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Shield, Tag, Plus, X, Pencil, Zap, Coins, Gem, Award } from "lucide-react";
import { toast } from "sonner";
import TagBadge from "@/components/tags/TagBadge";
import XPBar, { getLevelFromXP } from "@/components/profile/XPBar";

const TOKEN_GIF = "https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/b67743f1e_7208-dragocoin.gif";
const DIAMOND_GIF = "https://media.db.com/images/public/6a2b4508daca0f3dfc8f2429/abcabe201_2046-diamond-4.gif";

export default function AdminMembers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingProfile, setEditingProfile] = useState(null);
  const [xpAdd, setXpAdd] = useState("");
  const [tokensAmount, setTokensAmount] = useState("");
  const [diamondsAmount, setDiamondsAmount] = useState("");
  const [badgeToGive, setBadgeToGive] = useState("");
  const [currencyMode, setCurrencyMode] = useState("add");

  const { data: profiles = [] } = useQuery({
    queryKey: ["user-profiles"],
    queryFn: () => db.entities.UserProfile.list("-created_date", 200),
    staleTime: 0,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["member-tags"],
    queryFn: () => db.entities.MemberTag.list("-priority", 50),
    staleTime: 0,
  });

  const { data: storeItems = [] } = useQuery({
    queryKey: ["store-badges"],
    queryFn: () => db.entities.StoreItem.filter({ category: "badges", is_active: true }),
  });

  // Sort by created_date to get sequential IDs
  const sortedProfiles = [...profiles].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const profilesWithId = sortedProfiles.map((p, i) => ({ ...p, seq_id: i + 1 }));

  const filtered = profilesWithId.filter(p => {
    if (!search) return true;
    const s = search.trim().toLowerCase();
    return (
      p.username?.toLowerCase().includes(s) ||
      String(p.seq_id) === search.trim() ||
      p.user_id?.toLowerCase().includes(s) ||
      p.id?.toLowerCase().includes(s)
    );
  });

  // Invalidate all relevant caches
  const invalidateAll = (profile) => {
    qc.invalidateQueries({ queryKey: ["user-profiles"] });
    qc.invalidateQueries({ queryKey: ["profile-tags"] });
    if (profile?.user_id) {
      qc.invalidateQueries({ queryKey: ["profile-tags", profile.user_id] });
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.UserProfile.update(id, data),
    onSuccess: (_, vars) => {
      invalidateAll(editingProfile);
      toast.success("Perfil atualizado!");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const addXpMutation = useMutation({
    mutationFn: ({ profile, amount }) => {
      const newXP = (profile.xp || 0) + Number(amount);
      const info = getLevelFromXP(newXP);
      return db.entities.UserProfile.update(profile.id, { xp: newXP, level: info.level });
    },
    onSuccess: (_, { profile, amount }) => {
      const newXP = (profile.xp || 0) + Number(amount);
      const info = getLevelFromXP(newXP);
      // Update editingProfile state with new XP
      setEditingProfile(prev => prev ? { ...prev, xp: newXP, level: info.level } : prev);
      invalidateAll(profile);
      toast.success(`+${amount} XP adicionados!`);
      setXpAdd("");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const updateWallet = useMutation({
    mutationFn: async ({ userId, tokens, diamonds, mode }) => {
      if (!userId) throw new Error("Utilizador sem ID válido!");
      
      const wallets = await db.entities.Wallet.filter({ user_id: userId }, "-created_date", 1);
      const w = wallets[0];
      
      const currentTokens = w?.tokens ?? 0;
      const currentDiamonds = w?.diamonds ?? 0;
      const currentGems = w?.gems ?? 0;

      const tokenVal = tokens !== "" && tokens !== null && tokens !== undefined ? Number(tokens) : null;
      const diamondVal = diamonds !== "" && diamonds !== null && diamonds !== undefined ? Number(diamonds) : null;

      if (tokenVal === null && diamondVal === null) throw new Error("Nenhum valor para atualizar!");

      const newTokens = tokenVal !== null ? (mode === "set" ? tokenVal : currentTokens + tokenVal) : currentTokens;
      const newDiamonds = diamondVal !== null ? (mode === "set" ? diamondVal : currentDiamonds + diamondVal) : currentDiamonds;

      if (w) {
        return db.entities.Wallet.update(w.id, { tokens: newTokens, diamonds: newDiamonds, gems: currentGems });
      } else {
        return db.entities.Wallet.create({
          user_id: userId,
          tokens: newTokens,
          diamonds: newDiamonds,
          gems: 0,
        });
      }
    },
    onSuccess: (_, vars) => {
      // Invalidate all possible wallet query keys so every component refreshes
      qc.invalidateQueries({ queryKey: ["wallet-me"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["wallet-me", vars.userId] });
      toast.success("Carteira atualizada com sucesso!");
      setTokensAmount("");
      setDiamondsAmount("");
    },
    onError: (e) => toast.error(e.message),
  });

  const giveInventoryItem = useMutation({
    mutationFn: async ({ profile, badgeName }) => {
      const storeItem = storeItems.find(s => s.name === badgeName);
      return db.entities.Inventory.create({
        owner_id: profile.user_id || profile.id,
        owner_username: profile.username,
        item_type: "badge",
        item_name: badgeName,
        item_description: storeItem?.description || "",
        item_image: storeItem?.image_url || "",
        item_rarity: storeItem ? "epic" : "rare",
        quantity: 1,
      });
    },
    onSuccess: () => { toast.success("Badge atribuída!"); setBadgeToGive(""); },
    onError: (e) => toast.error(e.message),
  });

  const toggleTag = (tagName) => {
    if (!editingProfile) return;
    const currentTags = editingProfile.tags || [];
    const hasTag = currentTags.includes(tagName);
    const newTags = hasTag
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    
    // Update local state immediately for responsive UI
    setEditingProfile(prev => ({ ...prev, tags: newTags }));
    
    // Save to database
    updateProfileMutation.mutate(
      { id: editingProfile.id, data: { tags: newTags } },
      {
        onSuccess: () => {
          // Update the profile in the list too
          qc.setQueryData(["user-profiles"], (old) =>
            old ? old.map(p => p.id === editingProfile.id ? { ...p, tags: newTags } : p) : old
          );
        }
      }
    );
  };

  const allBadges = storeItems.map(s => s.name).filter(Boolean);

  const openEdit = (profile) => {
    setEditingProfile(profile);
    setXpAdd("");
    setTokensAmount("");
    setDiamondsAmount("");
    setBadgeToGive("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Membros & XP
        </h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nick, ID ou #número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(profile => {
          const info = getLevelFromXP(profile.xp || 0);
          const profileTags = (profile.tags || []).map(name => tags.find(t => t.name === name)).filter(Boolean);
          return (
            <div key={profile.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-center">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary mb-1">
                    #{profile.seq_id}
                  </div>
                  <Avatar className="w-10 h-10">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="rounded-full" /> : null}
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                      {(profile.username || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-1.5 mb-1">
                    <span className="font-bold">{profile.username}</span>
                    {profile.vip_tier && (
                      <Badge className="bg-cyan-400/20 text-cyan-400 border-cyan-400/30 text-xs">
                        VIP {profile.vip_tier}
                      </Badge>
                    )}
                    {profileTags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
                  </div>
                  <XPBar xp={profile.xp || 0} compact />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(profile.xp || 0).toLocaleString()} XP • Nível {info.level}
                    {profile.user_id && <span className="ml-2 opacity-50">ID: {profile.user_id.slice(0, 8)}...</span>}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={() => openEdit(profile)}>
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum membro encontrado</p>
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={(open) => !open && setEditingProfile(null)}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              #{editingProfile?.seq_id} — {editingProfile?.username}
            </DialogTitle>
          </DialogHeader>

          {editingProfile && (
            <div className="space-y-5">

              {/* XP Section */}
              <div className="space-y-3 border border-border rounded-xl p-4">
                <p className="font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> XP & Nível
                </p>
                <XPBar xp={editingProfile.xp || 0} />
                <p className="text-sm text-muted-foreground">
                  Nível {getLevelFromXP(editingProfile.xp || 0).level} — {(editingProfile.xp || 0).toLocaleString()} XP total
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Quantidade de XP"
                    value={xpAdd}
                    onChange={e => setXpAdd(e.target.value)}
                    className="bg-secondary border-none"
                    min="1"
                  />
                  <Button
                    size="sm"
                    className="gap-1.5 flex-shrink-0"
                    onClick={() => addXpMutation.mutate({ profile: editingProfile, amount: xpAdd })}
                    disabled={!xpAdd || Number(xpAdd) <= 0 || addXpMutation.isPending}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {addXpMutation.isPending ? "..." : "+XP"}
                  </Button>
                </div>
              </div>

              {/* Tokens & Diamonds */}
              <div className="space-y-3 border border-border rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-semibold flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-400" /> Tokens & Diamantes
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={currencyMode === "add" ? "default" : "secondary"}
                      className="h-7 text-xs px-3"
                      onClick={() => setCurrencyMode("add")}
                    >
                      + Adicionar
                    </Button>
                    <Button
                      size="sm"
                      variant={currencyMode === "set" ? "default" : "secondary"}
                      className="h-7 text-xs px-3"
                      onClick={() => setCurrencyMode("set")}
                    >
                      = Definir
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                      <img src={TOKEN_GIF} className="w-4 h-4 object-contain" alt="" /> Tokens
                    </p>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Ex: 1000"
                      value={tokensAmount}
                      onChange={e => setTokensAmount(e.target.value)}
                      className="bg-secondary border-none"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                      <img src={DIAMOND_GIF} className="w-4 h-4 object-contain" alt="" /> Diamantes
                    </p>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Ex: 500"
                      value={diamondsAmount}
                      onChange={e => setDiamondsAmount(e.target.value)}
                      className="bg-secondary border-none"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currencyMode === "add" ? "➕ Adiciona ao saldo atual" : "🔧 Substitui o saldo atual"}
                </p>
                <Button
                  className="w-full gap-2"
                  onClick={() => updateWallet.mutate({
                    userId: editingProfile.user_id,
                    tokens: tokensAmount,
                    diamonds: diamondsAmount,
                    mode: currencyMode,
                  })}
                  disabled={updateWallet.isPending || (!tokensAmount && !diamondsAmount)}
                >
                  {updateWallet.isPending
                    ? "A actualizar..."
                    : currencyMode === "add"
                      ? "Adicionar à Carteira"
                      : "Definir na Carteira"}
                </Button>
                {!editingProfile.user_id && (
                  <p className="text-xs text-destructive">⚠️ Este perfil não tem user_id associado</p>
                )}
              </div>

              {/* Dar Badge de Inventário */}
              <div className="space-y-3 border border-border rounded-xl p-4">
                <p className="font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" /> Dar Badge ao Inventário
                </p>
                <div className="flex gap-2">
                  <Select value={badgeToGive} onValueChange={setBadgeToGive}>
                    <SelectTrigger className="bg-secondary border-none flex-1">
                      <SelectValue placeholder="Escolhe uma badge..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allBadges.map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="gap-1.5 flex-shrink-0"
                    onClick={() => giveInventoryItem.mutate({ profile: editingProfile, badgeName: badgeToGive })}
                    disabled={!badgeToGive || giveInventoryItem.isPending}
                  >
                    <Award className="w-3.5 h-3.5" />
                    {giveInventoryItem.isPending ? "..." : "Dar"}
                  </Button>
                </div>
              </div>

              {/* VIP Tier */}
              <div className="space-y-3 border border-border rounded-xl p-4">
                <p className="font-semibold flex items-center gap-2">
                  <Gem className="w-4 h-4 text-cyan-400" /> VIP Tier
                </p>
                <div className="flex gap-2 flex-wrap">
                  {["", "bronze", "silver", "gold", "platinum", "diamond"].map(tier => (
                    <Button
                      key={tier}
                      size="sm"
                      variant={editingProfile.vip_tier === tier ? "default" : "secondary"}
                      onClick={() => {
                        setEditingProfile(prev => ({ ...prev, vip_tier: tier }));
                        updateProfileMutation.mutate({ id: editingProfile.id, data: { vip_tier: tier } });
                      }}
                      className="h-7 text-xs capitalize"
                    >
                      {tier === "" ? "Nenhum" : tier}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-3 border border-border rounded-xl p-4">
                <p className="font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" /> Tags do Membro
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => {
                    const hasTag = (editingProfile.tags || []).includes(tag.name);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.name)}
                        disabled={updateProfileMutation.isPending}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all text-xs font-medium ${
                          hasTag
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <TagBadge tag={tag} />
                        {hasTag
                          ? <X className="w-3 h-3 ml-0.5" />
                          : <Plus className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
                {tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">Cria tags em "Tags de Membros" primeiro.</p>
                )}
                {(editingProfile.tags?.length > 0) && (
                  <p className="text-xs text-muted-foreground">
                    Tags ativas: {editingProfile.tags.join(", ")}
                  </p>
                )}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}