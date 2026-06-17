import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { storeApi } from '@/services/api';
import type { StoreItem, InventoryItem } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ShoppingBag, Coins, ShoppingCart, Package, Loader2, Check } from 'lucide-react';

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'avatar', label: 'Avatar' },
  { value: 'banner', label: 'Banner' },
  { value: 'cosmetic', label: 'Cosméticos' },
  { value: 'booster', label: 'Boosters' },
  { value: 'title', label: 'Títulos' },
  { value: 'coins', label: 'Moedas' },
];

export default function StorePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const loadItems = async () => {
    const data = await storeApi.getItems(category, 0, 50);
    setItems(data);
  };

  const loadInventory = async () => {
    if (user) {
      const inv = await storeApi.getInventory(user.id);
      setInventory(inv);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadItems(), loadInventory()]);
      setLoading(false);
    };
    load();
  }, [category, user]);

  const owned = new Set(inventory.map(i => i.item_id));

  const handlePurchase = async (item: StoreItem) => {
    if (!user || !profile) { toast.error('Faça login para comprar'); return; }
    setPurchasing(item.id);
    try {
      await storeApi.purchase(user.id, item, profile.coins);
      await refreshProfile();
      await loadInventory();
      toast.success(`"${item.name}" adicionado ao seu inventário!`);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erro na compra');
    }
    setPurchasing(null);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" /> Loja
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Personalize sua experiência com itens exclusivos</p>
          </div>
          {profile && (
            <div className="flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-bold stat-mono text-primary">{profile.coins.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">moedas</span>
            </div>
          )}
        </div>

        <Tabs value={category} onValueChange={setCategory}>
          <div className="overflow-x-auto mb-6">
            <TabsList className="bg-secondary border border-border whitespace-nowrap w-max">
              {categories.map(c => (
                <TabsTrigger key={c.value} value={c.value} className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={category}>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array(10).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square bg-muted" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 border border-border text-muted-foreground">
                <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum item disponível</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map(item => {
                  const isOwned = owned.has(item.id);
                  const canAfford = (profile?.coins || 0) >= item.price;
                  return (
                    <div key={item.id} className={`border bg-card flex flex-col h-full ${isOwned ? 'border-primary/50' : 'border-border'} hover:border-primary/40 transition-colors`}>
                      <div className="aspect-square bg-secondary relative overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className={`w-full h-full object-cover ${isOwned ? '' : 'grayscale hover:grayscale-0'} transition-all`} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {isOwned && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <Check className="h-8 w-8 text-primary" />
                          </div>
                        )}
                        <Badge className="absolute top-1 right-1 text-xs bg-secondary text-muted-foreground border border-border px-1 capitalize">{item.category}</Badge>
                      </div>
                      <div className="p-3 flex flex-col gap-2 flex-1">
                        <p className="text-xs font-semibold text-balance leading-tight">{item.name}</p>
                        {item.description && <p className="text-xs text-muted-foreground text-pretty line-clamp-2">{item.description}</p>}
                        <div className="mt-auto flex items-center justify-between gap-2">
                          <span className="text-sm font-black stat-mono text-primary">{item.price} 🪙</span>
                          {isOwned ? (
                            <span className="text-xs text-primary font-medium">Possuído</span>
                          ) : (
                            <Button
                              size="sm"
                              className="text-xs h-7 px-2 font-bold"
                              onClick={() => handlePurchase(item)}
                              disabled={!user || !canAfford || purchasing === item.id}
                            >
                              {purchasing === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> :
                                !user ? 'Login' : !canAfford ? 'Sem saldo' : <ShoppingCart className="h-3 w-3" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Inventory */}
        {user && inventory.length > 0 && (
          <div className="mt-10">
            <h2 className="text-base font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Meu Inventário ({inventory.length})
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
              {inventory.map(inv => (
                <div key={inv.id} className="border border-primary/30 bg-primary/5 aspect-square flex flex-col items-center justify-center p-2 gap-1">
                  {inv.item?.image_url ? (
                    <img src={inv.item.image_url} alt={inv.item.name} className="w-10 h-10 object-cover" />
                  ) : <Package className="h-6 w-6 text-primary" />}
                  <p className="text-xs text-center text-primary font-medium line-clamp-1">{inv.item?.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
