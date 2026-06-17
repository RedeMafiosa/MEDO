import { supabase } from '@/db/supabase';
import type { Profile, Rank, Clan, Tournament, TournamentRegistration, Stream, StreamMessage, StoreItem, InventoryItem, Transaction } from '@/types/index';

// ============ PROFILES ============
export const profilesApi = {
  getById: async (id: string): Promise<Profile | null> => {
    const { data } = await supabase.from('profiles').select('*, rank:ranks(*)').eq('id', id).maybeSingle();
    return data;
  },
  getAll: async (page = 0, limit = 20): Promise<Profile[]> => {
    const { data } = await supabase.from('profiles').select('*, rank:ranks(*)').order('xp', { ascending: false }).range(page * limit, page * limit + limit - 1);
    return Array.isArray(data) ? data : [];
  },
  getRanking: async (limit = 50): Promise<Profile[]> => {
    const { data } = await supabase.from('profiles').select('*, rank:ranks(*)').order('xp', { ascending: false }).limit(limit);
    return Array.isArray(data) ? data : [];
  },
  update: async (id: string, updates: Partial<Profile>): Promise<Profile | null> => {
    const { data } = await supabase.from('profiles').update(updates).eq('id', id).select('*, rank:ranks(*)').maybeSingle();
    return data;
  },
  adminUpdate: async (id: string, updates: Partial<Profile>): Promise<Profile | null> => {
    const { data } = await supabase.from('profiles').update(updates).eq('id', id).select('*').maybeSingle();
    return data;
  },
};

// ============ RANKS ============
export const ranksApi = {
  getAll: async (): Promise<Rank[]> => {
    const { data } = await supabase.from('ranks').select('*').order('sort_order');
    return Array.isArray(data) ? data : [];
  },
  create: async (rank: Omit<Rank, 'id' | 'created_at'>): Promise<Rank | null> => {
    const { data } = await supabase.from('ranks').insert(rank).select().maybeSingle();
    return data;
  },
  update: async (id: string, updates: Partial<Rank>): Promise<Rank | null> => {
    const { data } = await supabase.from('ranks').update(updates).eq('id', id).select().maybeSingle();
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await supabase.from('ranks').delete().eq('id', id);
  },
};

// ============ CLANS ============
export const clansApi = {
  getAll: async (page = 0, limit = 20): Promise<Clan[]> => {
    const { data } = await supabase.from('clans').select('*, leader:profiles!leader_id(id, username, avatar_url)').order('total_xp', { ascending: false }).range(page * limit, page * limit + limit - 1);
    return Array.isArray(data) ? data : [];
  },
  getById: async (id: string): Promise<Clan | null> => {
    const { data } = await supabase.from('clans').select('*, leader:profiles!leader_id(id, username, avatar_url)').eq('id', id).maybeSingle();
    return data;
  },
  getMembers: async (clanId: string): Promise<{ profile: Profile }[]> => {
    const { data } = await supabase.from('clan_members').select('*, profile:profiles(*, rank:ranks(*))').eq('clan_id', clanId).order('joined_at');
    return Array.isArray(data) ? data : [];
  },
  create: async (clan: { name: string; tag: string; description?: string; leader_id: string }): Promise<Clan | null> => {
    const { data, error } = await supabase.from('clans').insert(clan).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  update: async (id: string, updates: Partial<Clan>): Promise<Clan | null> => {
    const { data } = await supabase.from('clans').update(updates).eq('id', id).select().maybeSingle();
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await supabase.from('clans').delete().eq('id', id);
  },
  join: async (clanId: string, userId: string): Promise<void> => {
    const { error } = await supabase.from('clan_members').insert({ clan_id: clanId, user_id: userId });
    if (error) throw error;
    await supabase.from('profiles').update({ clan_id: clanId }).eq('id', userId);
    await supabase.rpc('increment_clan_member_count', { clan_id_param: clanId });
  },
  leave: async (clanId: string, userId: string): Promise<void> => {
    await supabase.from('clan_members').delete().eq('clan_id', clanId).eq('user_id', userId);
    await supabase.from('profiles').update({ clan_id: null }).eq('id', userId);
  },
};

// ============ TOURNAMENTS ============
export const tournamentsApi = {
  getAll: async (status?: string, page = 0, limit = 20): Promise<Tournament[]> => {
    let query = supabase.from('tournaments').select('*').order('created_at', { ascending: false }).range(page * limit, page * limit + limit - 1);
    if (status && status !== 'all') query = query.eq('status', status);
    const { data } = await query;
    return Array.isArray(data) ? data : [];
  },
  getById: async (id: string): Promise<Tournament | null> => {
    const { data } = await supabase.from('tournaments').select('*').eq('id', id).maybeSingle();
    return data;
  },
  getRegistrations: async (tournamentId: string): Promise<TournamentRegistration[]> => {
    const { data } = await supabase.from('tournament_registrations').select('*, profile:profiles(id, username, avatar_url, rank:ranks(*))').eq('tournament_id', tournamentId).order('registered_at');
    return Array.isArray(data) ? data : [];
  },
  isRegistered: async (tournamentId: string, userId: string): Promise<boolean> => {
    const { data } = await supabase.from('tournament_registrations').select('id').eq('tournament_id', tournamentId).eq('user_id', userId).maybeSingle();
    return !!data;
  },
  register: async (tournamentId: string, userId: string): Promise<void> => {
    const { error } = await supabase.from('tournament_registrations').insert({ tournament_id: tournamentId, user_id: userId });
    if (error) throw error;
    // increment participant_count via rpc or raw increment
    const { data: t } = await supabase.from('tournaments').select('participant_count').eq('id', tournamentId).maybeSingle();
    if (t) {
      await supabase.from('tournaments').update({ participant_count: (t.participant_count || 0) + 1 }).eq('id', tournamentId);
    }
  },
  unregister: async (tournamentId: string, userId: string): Promise<void> => {
    await supabase.from('tournament_registrations').delete().eq('tournament_id', tournamentId).eq('user_id', userId);
  },
  create: async (tournament: Omit<Tournament, 'id' | 'created_at' | 'participant_count'>): Promise<Tournament | null> => {
    const { data, error } = await supabase.from('tournaments').insert(tournament).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  update: async (id: string, updates: Partial<Tournament>): Promise<Tournament | null> => {
    const { data } = await supabase.from('tournaments').update(updates).eq('id', id).select().maybeSingle();
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await supabase.from('tournaments').delete().eq('id', id);
  },
};

// ============ STREAMS ============
export const streamsApi = {
  getAll: async (status?: string, page = 0, limit = 20): Promise<Stream[]> => {
    let query = supabase.from('streams').select('*, streamer:profiles!streamer_id(id, username, avatar_url)').order('is_featured', { ascending: false }).order('viewers', { ascending: false }).range(page * limit, page * limit + limit - 1);
    if (status && status !== 'all') query = query.eq('status', status);
    const { data } = await query;
    return Array.isArray(data) ? data : [];
  },
  getById: async (id: string): Promise<Stream | null> => {
    const { data } = await supabase.from('streams').select('*, streamer:profiles!streamer_id(id, username, avatar_url)').eq('id', id).maybeSingle();
    return data;
  },
  getMessages: async (streamId: string, limit = 50): Promise<StreamMessage[]> => {
    const { data } = await supabase.from('stream_messages').select('*, profile:profiles(id, username, avatar_url)').eq('stream_id', streamId).order('created_at', { ascending: false }).limit(limit);
    return Array.isArray(data) ? (data as StreamMessage[]).reverse() : [];
  },
  sendMessage: async (streamId: string, userId: string, content: string): Promise<void> => {
    const { error } = await supabase.from('stream_messages').insert({ stream_id: streamId, user_id: userId, content });
    if (error) throw error;
  },
  create: async (stream: { title: string; description?: string; streamer_id: string; stream_url?: string; thumbnail_url?: string; game?: string }): Promise<Stream | null> => {
    const { data, error } = await supabase.from('streams').insert(stream).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  update: async (id: string, updates: Partial<Stream>): Promise<Stream | null> => {
    const { data } = await supabase.from('streams').update(updates).eq('id', id).select().maybeSingle();
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await supabase.from('streams').delete().eq('id', id);
  },
  subscribeToMessages: (streamId: string, callback: (msg: StreamMessage) => void) => {
    return supabase.channel(`stream-${streamId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stream_messages', filter: `stream_id=eq.${streamId}` }, async (payload) => {
        const { data } = await supabase.from('stream_messages').select('*, profile:profiles(id, username, avatar_url)').eq('id', payload.new.id).maybeSingle();
        if (data) callback(data as StreamMessage);
      }).subscribe();
  },
};

// ============ STORE ============
export const storeApi = {
  getItems: async (category?: string, page = 0, limit = 20): Promise<StoreItem[]> => {
    let query = supabase.from('store_items').select('*').eq('is_active', true).order('created_at', { ascending: false }).range(page * limit, page * limit + limit - 1);
    if (category && category !== 'all') query = query.eq('category', category);
    const { data } = await query;
    return Array.isArray(data) ? data : [];
  },
  getAllItems: async (): Promise<StoreItem[]> => {
    const { data } = await supabase.from('store_items').select('*').order('created_at', { ascending: false }).limit(100);
    return Array.isArray(data) ? data : [];
  },
  createItem: async (item: Omit<StoreItem, 'id' | 'created_at'>): Promise<StoreItem | null> => {
    const { data, error } = await supabase.from('store_items').insert(item).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  updateItem: async (id: string, updates: Partial<StoreItem>): Promise<StoreItem | null> => {
    const { data } = await supabase.from('store_items').update(updates).eq('id', id).select().maybeSingle();
    return data;
  },
  deleteItem: async (id: string): Promise<void> => {
    await supabase.from('store_items').delete().eq('id', id);
  },
  purchase: async (userId: string, item: StoreItem, currentCoins: number): Promise<void> => {
    if (currentCoins < item.price) throw new Error('Saldo insuficiente de moedas');
    const { error: invErr } = await supabase.from('inventory').insert({ user_id: userId, item_id: item.id });
    if (invErr) throw new Error('Você já possui este item');
    await supabase.from('profiles').update({ coins: currentCoins - item.price }).eq('id', userId);
    await supabase.from('transactions').insert({ user_id: userId, amount: -item.price, type: 'purchase', description: `Compra: ${item.name}`, item_id: item.id });
  },
  getInventory: async (userId: string): Promise<InventoryItem[]> => {
    const { data } = await supabase.from('inventory').select('*, item:store_items(*)').eq('user_id', userId).order('acquired_at', { ascending: false }).limit(100);
    return Array.isArray(data) ? data : [];
  },
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    const { data } = await supabase.from('transactions').select('*, item:store_items(name)').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    return Array.isArray(data) ? data : [];
  },
};

// ============ SITE SETTINGS ============
export const settingsApi = {
  getAll: async (): Promise<Record<string, string>> => {
    const { data } = await supabase.from('site_settings').select('key, value');
    if (!Array.isArray(data)) return {};
    return (data as { key: string; value: string }[]).reduce((acc: Record<string, string>, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  },
  set: async (key: string, value: string): Promise<void> => {
    await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  },
  setMany: async (settings: Record<string, string>): Promise<void> => {
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
  },
};
