export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  background_url: string | null;
  bio: string | null;
  role: 'user' | 'admin';
  rank_id: string | null;
  clan_id: string | null;
  xp: number;
  coins: number;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
  rank?: Rank;
  clan?: Clan;
}

export interface Rank {
  id: string;
  name: string;
  icon: string;
  color: string;
  min_xp: number;
  sort_order: number;
  created_at: string;
}

export interface MemberTagRecord {
  id: string;
  name: string;
  variant: string;
  icon: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string | null;
  emblem_url: string | null;
  leader_id: string;
  total_xp: number;
  member_count: number;
  created_at: string;
  leader?: Profile;
}

export interface ClanMember {
  id: string;
  clan_id: string;
  user_id: string;
  joined_at: string;
  profile?: Profile;
}

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  game: string;
  status: 'open' | 'ongoing' | 'finished' | 'cancelled';
  max_participants: number;
  participant_count: number;
  start_date: string | null;
  prize: string | null;
  rules: string | null;
  banner_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  registered_at: string;
  profile?: Profile;
}

export interface Stream {
  id: string;
  title: string;
  description: string | null;
  streamer_id: string;
  stream_url: string | null;
  thumbnail_url: string | null;
  game: string | null;
  status: 'pending' | 'live' | 'offline' | 'rejected';
  viewers: number;
  is_featured: boolean;
  created_at: string;
  streamer?: Profile;
}

export interface StreamMessage {
  id: string;
  stream_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  acquired_at: string;
  item?: StoreItem;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'reward' | 'gift' | 'admin_grant';
  description: string | null;
  item_id: string | null;
  created_at: string;
  item?: StoreItem;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}
