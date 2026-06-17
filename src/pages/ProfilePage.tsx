import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { profilesApi, storeApi } from '@/services/api';
import type { Profile, InventoryItem } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/use-image-upload';
import {
  User, Edit2, Save, X, Shield, Trophy, Package, Zap, Coins,
  Camera, ImagePlus, Heart, Eye, MessageSquare, Star, Loader2,
  Award, Tag,
} from 'lucide-react';
import { MemberTag } from '@/components/ui/member-tag';

// ─── Conquistas mock data ──────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first_msg', icon: MessageSquare, label: 'Primeira Mensagem', desc: 'Enviou sua primeira mensagem', unlocked: false },
  { id: 'vip', icon: Star, label: 'Membro VIP', desc: 'Tornou-se membro VIP', unlocked: false },
  { id: 'donor', icon: Heart, label: 'Doador Generoso', desc: 'Fez uma doação', unlocked: false },
  { id: 'streamer', icon: Eye, label: 'Streamer', desc: 'Transmitiu ao vivo', unlocked: false },
  { id: 'top10', icon: Trophy, label: 'Top 10 Ranking', desc: 'Entrou no top 10', unlocked: false },
  { id: 'og', icon: Award, label: 'Membro OG', desc: 'Membro original', unlocked: false },
];

// ─── Image upload button ───────────────────────────────────────────────────────
function UploadButton({
  onFile,
  uploading,
  children,
  className = '',
}: {
  onFile: (f: File) => void;
  uploading: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${className}`}
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : children}
      </button>
    </>
  );
}

// ─── Level XP progress bar ─────────────────────────────────────────────────────
function XpBar({ xp, currentLevel, nextLevel }: { xp: number; currentLevel: number; nextLevel: number }) {
  const minXp = currentLevel * 100;
  const maxXp = nextLevel * 100;
  const progress = Math.min(100, Math.max(0, ((xp - minXp) / (maxXp - minXp)) * 100));
  return (
    <div className="px-6 py-3 border-b border-border">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground font-mono">Nível {currentLevel}</span>
        <span className="text-xs text-primary font-bold font-mono">
          {xp} / {maxXp} XP ({Math.round(progress)}%)
        </span>
        <span className="text-xs text-muted-foreground font-mono">Nível {nextLevel}</span>
      </div>
      <div className="h-4 bg-secondary border border-border relative overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary-foreground mix-blend-difference z-10">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile: myProfile, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'conquistas' | 'inventario' | 'tags'>('conquistas');
  const { uploadImage, uploading } = useImageUpload();

  const targetId = id || user?.id;
  const isOwnProfile = user?.id === targetId;

  // Derived level from XP (every 100 XP = 1 level)
  const currentLevel = profile ? Math.floor(profile.xp / 100) + 1 : 1;
  const nextLevel = currentLevel + 1;

  useEffect(() => {
    if (!targetId) return;
    const load = async () => {
      const [p, inv] = await Promise.all([
        profilesApi.getById(targetId),
        storeApi.getInventory(targetId),
      ]);
      setProfile(p);
      setInventory(inv);
      setLoading(false);
    };
    load();
  }, [targetId]);

  const startEditing = () => {
    setEditData({ username: profile?.username || '', bio: profile?.bio || '' });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!targetId) return;
    if (!editData.username.trim()) { toast.error('Nome de usuário não pode ser vazio'); return; }
    setSaving(true);
    try {
      const updated = await profilesApi.update(targetId, { username: editData.username.trim(), bio: editData.bio || null });
      setProfile(updated);
      await refreshProfile();
      setEditing(false);
      toast.success('Perfil atualizado!');
    } catch { toast.error('Erro ao salvar perfil'); }
    setSaving(false);
  };

  // ─── Upload handlers ───────────────────────────────────────────────────────
  const handleUploadAvatar = async (file: File) => {
    if (!targetId) return;
    const url = await uploadImage(file, 'avatars', targetId, 'avatar');
    if (!url) return;
    const updated = await profilesApi.update(targetId, { avatar_url: url });
    setProfile(updated);
    await refreshProfile();
    toast.success('Avatar atualizado!');
  };

  const handleUploadBanner = async (file: File) => {
    if (!targetId) return;
    const url = await uploadImage(file, 'banners', targetId, 'banner');
    if (!url) return;
    const updated = await profilesApi.update(targetId, { banner_url: url });
    setProfile(updated);
    await refreshProfile();
    toast.success('Capa atualizada!');
  };

  const handleUploadBackground = async (file: File) => {
    if (!targetId) return;
    const url = await uploadImage(file, 'backgrounds', targetId, 'bg');
    if (!url) return;
    const updated = await profilesApi.update(targetId, { background_url: url });
    setProfile(updated);
    await refreshProfile();
    toast.success('Fundo do perfil atualizado!');
  };

  // ─── Loading / empty states ────────────────────────────────────────────────
  if (!targetId) return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">
        <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>Faça login para ver seu perfil</p>
      </div>
    </AppLayout>
  );

  if (loading) return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-4">
        <Skeleton className="h-48 bg-muted" />
        <Skeleton className="h-24 bg-muted" />
        <Skeleton className="h-64 bg-muted" />
      </div>
    </AppLayout>
  );

  if (!profile) return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">Perfil não encontrado</div>
    </AppLayout>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      {/* Full-page background */}
      <div className="relative min-h-[calc(100vh-3.5rem)]">
        {/* Background image (behind everything) */}
        {profile.background_url && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{ backgroundImage: `url(${profile.background_url})` }}
          >
            <div className="absolute inset-0 bg-background/75" />
          </div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-8">

          {/* Background upload button (own profile only) */}
          {isOwnProfile && (
            <div className="flex justify-end mb-2">
              <UploadButton onFile={handleUploadBackground} uploading={uploading} className="border border-border bg-card/80 px-3 py-1.5 hover:border-primary hover:text-primary text-muted-foreground">
                <ImagePlus className="h-3.5 w-3.5" />
                Fundo do Perfil
              </UploadButton>
            </div>
          )}

          {/* ── Profile card ────────────────────────────────────────── */}
          <div className="border border-border bg-card/90 backdrop-blur-sm">

            {/* Banner / Cover */}
            <div className="relative h-36 md:h-52 bg-secondary overflow-hidden">
              {profile.banner_url ? (
                <img src={profile.banner_url} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, hsl(240 8% 10%), hsl(240 8% 18%))' }} />
              )}
              {isOwnProfile && (
                <UploadButton
                  onFile={handleUploadBanner}
                  uploading={uploading}
                  className="absolute top-3 right-3 bg-background/70 border border-border px-2.5 py-1.5 hover:border-primary hover:text-primary text-muted-foreground backdrop-blur-sm"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Alterar Capa
                </UploadButton>
              )}
            </div>

            {/* Avatar row */}
            <div className="px-4 md:px-6 -mt-10 mb-0">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-20 w-20 md:h-24 md:w-24 border-4 border-card bg-secondary overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.username || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-primary">
                        {profile.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  {/* Online indicator */}
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-primary border-2 border-card rounded-full" />
                  {isOwnProfile && (
                    <UploadButton
                      onFile={handleUploadAvatar}
                      uploading={uploading}
                      className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Camera className="h-5 w-5 text-white" />
                    </UploadButton>
                  )}
                </div>

                {/* Name / info */}
                <div className="flex-1 min-w-0 pt-10 sm:pt-12">
                  {editing ? (
                    <div className="flex flex-col gap-3 max-w-sm">
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs font-normal">Usuário</Label>
                        <Input value={editData.username} onChange={e => setEditData(p => ({ ...p, username: e.target.value }))} className="h-8 bg-secondary border-border text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs font-normal">Bio</Label>
                        <Textarea value={editData.bio} onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))} className="bg-secondary border-border text-sm resize-none" rows={2} placeholder="Sobre você..." />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 font-bold text-xs h-8">
                          <Save className="h-3 w-3" /> Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="gap-1.5 text-xs h-8 border border-border">
                          <X className="h-3 w-3" /> Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h1 className="text-xl md:text-2xl font-black text-balance">{profile.username || 'Jogador'}</h1>
                          {profile.role === 'admin' && (
                            <MemberTag variant="admin" label="Admin" size="sm" />
                          )}
                          {profile.rank && (
                            <MemberTag variant="rank" label={`${profile.rank.icon ?? ''} ${profile.rank.name}`.trim()} color={profile.rank.color} size="sm" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">
                          ID: {profile.id.slice(0, 8)}...
                        </p>
                        {profile.bio && <p className="text-sm text-muted-foreground text-pretty">{profile.bio}</p>}
                      </div>
                      {isOwnProfile && (
                        <Button size="sm" variant="ghost" onClick={startEditing} className="gap-1.5 text-xs border border-border shrink-0 h-8 hover:border-primary hover:text-primary">
                          <Edit2 className="h-3 w-3" /> Editar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-4">
              <XpBar xp={profile.xp} currentLevel={currentLevel} nextLevel={nextLevel} />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
              {[
                { icon: Heart, label: 'Likes', value: '0', color: 'text-accent' },
                { icon: Eye, label: 'Visualizações', value: '0', color: 'text-primary' },
                { icon: Coins, label: 'Diamantes', value: profile.coins.toLocaleString(), color: 'text-primary' },
                { icon: MessageSquare, label: 'Mensagens', value: '0', color: 'text-muted-foreground' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-card flex flex-col items-center justify-center py-5 gap-1.5 hover:bg-secondary/50 transition-colors">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className={`text-xl font-black stat-mono ${color}`}>{value}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tabs ────────────────────────────────────────────────── */}
          <div className="border border-border border-t-0 bg-card/90 backdrop-blur-sm">
            {/* Tab headers */}
            <div className="flex border-b border-border">
              {[
                { key: 'conquistas', icon: Trophy, label: 'Conquistas' },
                { key: 'inventario', icon: Package, label: 'Inventário' },
                { key: 'tags', icon: Tag, label: 'Tags' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">

              {/* Conquistas */}
              {activeTab === 'conquistas' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                  {ACHIEVEMENTS.map(ach => {
                    const Icon = ach.icon;
                    return (
                      <div
                        key={ach.id}
                        className={`border flex flex-col items-center justify-center p-5 gap-3 transition-colors ${
                          ach.unlocked ? 'border-primary/50 bg-primary/5' : 'border-border bg-secondary/30'
                        }`}
                      >
                        <div className={`p-3 border ${ach.unlocked ? 'border-primary/50 text-primary' : 'border-border text-muted-foreground/40'}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-bold ${ach.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{ach.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{ach.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inventário */}
              {activeTab === 'inventario' && (
                inventory.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Inventário vazio</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {inventory.map(item => (
                      <div key={item.id} className="border border-primary/20 bg-primary/5 aspect-square flex flex-col items-center justify-center p-2 gap-1">
                        {item.item?.image_url ? (
                          <img src={item.item.image_url} alt={item.item.name} className="w-10 h-10 object-contain" />
                        ) : <Package className="h-5 w-5 text-primary" />}
                        <p className="text-xs text-center text-primary line-clamp-1">{item.item?.name}</p>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tags */}
              {activeTab === 'tags' && (
                <div className="flex flex-col gap-6">
                  {/* Admin / Staff tags */}
                  {profile.role === 'admin' && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-bold">Tags de Administração</p>
                      <div className="flex flex-wrap gap-3">
                        <MemberTag variant="fundador" label="Fundador" />
                        <MemberTag variant="dono" label="Dono" />
                        <MemberTag variant="admin" label="Admin" />
                        <MemberTag variant="moderador" label="Moderador" />
                      </div>
                    </div>
                  )}

                  {/* Special role tags */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-bold">Tags Especiais</p>
                    <div className="flex flex-wrap gap-3">
                      <MemberTag variant="vip" label="VIP" />
                      <MemberTag variant="booster" label="Booster" />
                      <MemberTag variant="og" label="Membro OG" />
                      <MemberTag variant="streamer" label="Streamer" />
                    </div>
                  </div>

                  {/* Profile tags */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-bold">Minhas Tags</p>
                    <div className="flex flex-wrap gap-3">
                      {profile.rank && (
                        <MemberTag variant="rank" label={`${profile.rank.icon ?? ''} ${profile.rank.name}`.trim()} color={profile.rank.color} />
                      )}
                      {profile.clan_id && (
                        <MemberTag variant="default" label="Membro de Clan" icon={<Shield className="h-3 w-3" />} />
                      )}
                      <MemberTag variant="default" label={`${profile.xp} XP`} icon={<Zap className="h-3 w-3" />} />
                      {inventory.length > 0 && (
                        <MemberTag variant="default" label={`${inventory.length} Itens`} icon={<Package className="h-3 w-3" />} />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
