
-- Enums
CREATE TYPE public.user_role AS ENUM ('user', 'admin');
CREATE TYPE public.tournament_status AS ENUM ('open', 'ongoing', 'finished', 'cancelled');
CREATE TYPE public.stream_status AS ENUM ('pending', 'live', 'offline', 'rejected');
CREATE TYPE public.transaction_type AS ENUM ('purchase', 'reward', 'gift', 'admin_grant');

-- Ranks table
CREATE TABLE public.ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT '🏅',
  color text NOT NULL DEFAULT '#6b7280',
  min_xp integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  username text UNIQUE,
  avatar_url text,
  banner_url text,
  bio text,
  role public.user_role NOT NULL DEFAULT 'user',
  rank_id uuid REFERENCES public.ranks(id),
  clan_id uuid,
  xp integer NOT NULL DEFAULT 0,
  coins integer NOT NULL DEFAULT 500,
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Clans table
CREATE TABLE public.clans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  tag text NOT NULL UNIQUE,
  description text,
  emblem_url text,
  leader_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp integer NOT NULL DEFAULT 0,
  member_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add clan FK to profiles after clans table exists
ALTER TABLE public.profiles ADD CONSTRAINT profiles_clan_id_fkey FOREIGN KEY (clan_id) REFERENCES public.clans(id) ON DELETE SET NULL;

-- Clan members
CREATE TABLE public.clan_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tournaments
CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  game text NOT NULL DEFAULT 'Unknown',
  status public.tournament_status NOT NULL DEFAULT 'open',
  max_participants integer NOT NULL DEFAULT 16,
  participant_count integer NOT NULL DEFAULT 0,
  start_date timestamptz,
  prize text,
  rules text,
  banner_url text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tournament registrations
CREATE TABLE public.tournament_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Streams
CREATE TABLE public.streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  streamer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stream_url text,
  thumbnail_url text,
  game text,
  status public.stream_status NOT NULL DEFAULT 'pending',
  viewers integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Stream chat messages
CREATE TABLE public.stream_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Store items
CREATE TABLE public.store_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price integer NOT NULL DEFAULT 100,
  image_url text,
  category text NOT NULL DEFAULT 'cosmetic',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Inventory
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.store_items(id) ON DELETE CASCADE,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type public.transaction_type NOT NULL DEFAULT 'purchase',
  description text,
  item_id uuid REFERENCES public.store_items(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Site settings (key-value for admin customization)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================
-- Triggers & Functions
-- =====================

-- Auto-sync new users to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_rank_id uuid;
BEGIN
  SELECT id INTO default_rank_id FROM public.ranks ORDER BY min_xp ASC LIMIT 1;
  INSERT INTO public.profiles (id, email, role, rank_id)
  VALUES (NEW.id, NEW.email, 'user'::public.user_role, default_rank_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: get user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

-- Helper: check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_banned FROM public.profiles WHERE id = uid;
$$;

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Public profiles view (safe to expose)
CREATE VIEW public.public_profiles AS
  SELECT id, username, avatar_url, rank_id, clan_id, xp, created_at FROM public.profiles;

-- =====================
-- Default Ranks Seed
-- =====================
INSERT INTO public.ranks (name, icon, color, min_xp, sort_order) VALUES
  ('Bronze', '🥉', '#cd7f32', 0, 1),
  ('Prata', '🥈', '#c0c0c0', 500, 2),
  ('Ouro', '🥇', '#ffd700', 1500, 3),
  ('Platina', '💎', '#e5e4e2', 3000, 4),
  ('Diamante', '💠', '#b9f2ff', 6000, 5),
  ('Mestre', '⚡', '#ff6b35', 10000, 6),
  ('Grão-Mestre', '👑', '#ff0000', 20000, 7);

-- =====================
-- Default Site Settings
-- =====================
INSERT INTO public.site_settings (key, value) VALUES
  ('primary_color', '#CCFF00'),
  ('secondary_color', '#1a1a2e'),
  ('accent_color', '#FF2A2A'),
  ('background_color', '#0A0A0C'),
  ('text_color', '#FFFFFF'),
  ('font_heading', 'Inter'),
  ('font_body', 'Inter'),
  ('site_name', 'GamingHub'),
  ('site_tagline', 'Compete. Connect. Conquer.'),
  ('hero_text', 'A arena definitiva dos gamers'),
  ('dark_mode', 'true');

-- =====================
-- Default Store Items
-- =====================
INSERT INTO public.store_items (name, description, price, image_url, category) VALUES
  ('Avatar Neon', 'Moldura especial neon para avatar', 150, 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=200&h=200&fit=crop', 'avatar'),
  ('Banner Ciberpunk', 'Banner futurista para perfil', 200, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop', 'banner'),
  ('Título Lendário', 'Título exclusivo no perfil', 300, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop', 'title'),
  ('XP Booster x2', 'Dobra XP por 24 horas', 100, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', 'booster'),
  ('Moedas +1000', 'Pacote de 1000 moedas bônus', 250, 'https://images.unsplash.com/photo-1466939256816-7c3f91c97f5b?w=200&h=200&fit=crop', 'coins'),
  ('Emote Épico', 'Emote exclusivo para usar no chat', 80, 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=200&h=200&fit=crop', 'cosmetic');

-- =====================
-- Default Tournaments
-- =====================
INSERT INTO public.tournaments (name, description, game, status, max_participants, prize, rules) VALUES
  ('Campeonato Nacional 2026', 'O maior torneio do ano com premiação exclusiva', 'Free Fire', 'open', 64, 'R$ 5.000 em prêmios', 'Regras padrão de competição. Sem uso de cheats.'),
  ('Copa Clan Wars', 'Batalha entre os melhores clans da plataforma', 'Valorant', 'open', 32, 'Troféu + 500 moedas por membro', 'Apenas clans registrados podem participar.'),
  ('Torneio Solo Series', 'Competição individual para os melhores jogadores', 'CS2', 'ongoing', 16, '200 moedas + título especial', 'Formato de eliminação simples.');
