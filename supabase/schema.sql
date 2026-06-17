-- =============================================================
-- GamingHub — Schema Completo da Base de Dados
-- =============================================================
-- Para restaurar numa nova instância Supabase:
-- 1. Crie um novo projeto em https://supabase.com
-- 2. Vá a SQL Editor → cole este ficheiro → Run
-- =============================================================

-- ── ENUMs ─────────────────────────────────────────────────────
CREATE TYPE user_role        AS ENUM ('user', 'admin');
CREATE TYPE stream_status    AS ENUM ('pending', 'live', 'offline', 'rejected');
CREATE TYPE tournament_status AS ENUM ('open', 'ongoing', 'finished', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('purchase', 'reward', 'gift', 'admin_grant');

-- ── Helper: get_user_role (SECURITY DEFINER) ──────────────────
CREATE OR REPLACE FUNCTION get_user_role(uid uuid)
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

-- ── TABELAS ───────────────────────────────────────────────────

CREATE TABLE profiles (
  id             uuid PRIMARY KEY,
  email          text,
  username       text,
  avatar_url     text,
  banner_url     text,
  background_url text,
  bio            text,
  role           user_role NOT NULL DEFAULT 'user',
  rank_id        uuid,
  clan_id        uuid,
  xp             integer NOT NULL DEFAULT 0,
  coins          integer NOT NULL DEFAULT 500,
  is_banned      boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ranks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  icon        text NOT NULL DEFAULT '🏅',
  color       text NOT NULL DEFAULT '#6b7280',
  min_xp      integer NOT NULL DEFAULT 0,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE member_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  variant     text NOT NULL DEFAULT 'default',
  icon        text NOT NULL DEFAULT '🏷️',
  description text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  tag          text NOT NULL,
  description  text,
  emblem_url   text,
  leader_id    uuid NOT NULL,
  total_xp     integer NOT NULL DEFAULT 0,
  member_count integer NOT NULL DEFAULT 1,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clan_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id   uuid NOT NULL,
  user_id   uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tournaments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  description       text,
  game              text NOT NULL DEFAULT 'Unknown',
  status            tournament_status NOT NULL DEFAULT 'open',
  max_participants  integer NOT NULL DEFAULT 16,
  participant_count integer NOT NULL DEFAULT 0,
  start_date        timestamptz,
  prize             text,
  rules             text,
  banner_url        text,
  created_by        uuid,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tournament_registrations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   uuid NOT NULL,
  user_id         uuid NOT NULL,
  registered_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE streams (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  streamer_id   uuid NOT NULL,
  stream_url    text,
  thumbnail_url text,
  game          text,
  status        stream_status NOT NULL DEFAULT 'pending',
  viewers       integer NOT NULL DEFAULT 0,
  is_featured   boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE stream_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id  uuid NOT NULL,
  user_id    uuid NOT NULL,
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE store_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  price       integer NOT NULL DEFAULT 100,
  image_url   text,
  category    text NOT NULL DEFAULT 'cosmetic',
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE inventory (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  item_id     uuid NOT NULL,
  acquired_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  amount      integer NOT NULL,
  type        transaction_type NOT NULL DEFAULT 'purchase',
  description text,
  item_id     uuid,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  type       text NOT NULL DEFAULT 'info',
  message    text NOT NULL,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE site_settings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text NOT NULL UNIQUE,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── FOREIGN KEYS ──────────────────────────────────────────────
ALTER TABLE profiles              ADD FOREIGN KEY (rank_id)        REFERENCES ranks(id)        ON DELETE SET NULL;
ALTER TABLE profiles              ADD FOREIGN KEY (clan_id)        REFERENCES clans(id)        ON DELETE SET NULL;
ALTER TABLE clans                 ADD FOREIGN KEY (leader_id)      REFERENCES profiles(id)     ON DELETE CASCADE;
ALTER TABLE clan_members          ADD FOREIGN KEY (clan_id)        REFERENCES clans(id)        ON DELETE CASCADE;
ALTER TABLE clan_members          ADD FOREIGN KEY (user_id)        REFERENCES profiles(id)     ON DELETE CASCADE;
ALTER TABLE tournaments           ADD FOREIGN KEY (created_by)     REFERENCES profiles(id)     ON DELETE SET NULL;
ALTER TABLE tournament_registrations ADD FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE;
ALTER TABLE tournament_registrations ADD FOREIGN KEY (user_id)     REFERENCES profiles(id)     ON DELETE CASCADE;
ALTER TABLE streams               ADD FOREIGN KEY (streamer_id)    REFERENCES profiles(id)     ON DELETE CASCADE;
ALTER TABLE stream_messages       ADD FOREIGN KEY (stream_id)      REFERENCES streams(id)      ON DELETE CASCADE;
ALTER TABLE stream_messages       ADD FOREIGN KEY (user_id)        REFERENCES profiles(id)     ON DELETE CASCADE;
ALTER TABLE inventory             ADD FOREIGN KEY (user_id)        REFERENCES profiles(id)     ON DELETE CASCADE;
ALTER TABLE inventory             ADD FOREIGN KEY (item_id)        REFERENCES store_items(id)  ON DELETE CASCADE;
ALTER TABLE transactions          ADD FOREIGN KEY (user_id)        REFERENCES profiles(id)     ON DELETE CASCADE;
ALTER TABLE transactions          ADD FOREIGN KEY (item_id)        REFERENCES store_items(id)  ON DELETE SET NULL;
ALTER TABLE notifications         ADD FOREIGN KEY (user_id)        REFERENCES profiles(id)     ON DELETE CASCADE;

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clans                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams               ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory             ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings         ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Public can view profiles"    ON profiles FOR SELECT TO anon        USING (true);
CREATE POLICY "Users view own profile"      ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile"    ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (NOT (role IS DISTINCT FROM get_user_role(auth.uid())));
CREATE POLICY "Admins full access profiles" ON profiles FOR ALL    TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- ranks
CREATE POLICY "Anyone can view ranks"  ON ranks FOR SELECT USING (true);
CREATE POLICY "Admins manage ranks"    ON ranks FOR ALL   TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- member_tags
CREATE POLICY "member_tags_select_all"    ON member_tags FOR SELECT                USING (true);
CREATE POLICY "member_tags_insert_admin"  ON member_tags FOR INSERT TO authenticated WITH CHECK (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "member_tags_update_admin"  ON member_tags FOR UPDATE TO authenticated USING (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "member_tags_delete_admin"  ON member_tags FOR DELETE TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- clans
CREATE POLICY "Anyone can view clans"        ON clans FOR SELECT                USING (true);
CREATE POLICY "Authenticated can create clans" ON clans FOR INSERT TO authenticated WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Leaders can update their clan"  ON clans FOR UPDATE TO authenticated USING (auth.uid() = leader_id);
CREATE POLICY "Leaders can delete their clan"  ON clans FOR DELETE TO authenticated USING (auth.uid() = leader_id);
CREATE POLICY "Admins full access clans"       ON clans FOR ALL    TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- clan_members
CREATE POLICY "Anyone can view clan members"  ON clan_members FOR SELECT                USING (true);
CREATE POLICY "Authenticated can join clans"  ON clan_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave clans"         ON clan_members FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins full access clan_members" ON clan_members FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- tournaments
CREATE POLICY "Anyone can view tournaments"         ON tournaments FOR SELECT                USING (true);
CREATE POLICY "Authenticated can create tournaments" ON tournaments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Creators can update their tournament" ON tournaments FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Admins manage tournaments"            ON tournaments FOR ALL    TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- tournament_registrations
CREATE POLICY "Anyone can view registrations"          ON tournament_registrations FOR SELECT                USING (true);
CREATE POLICY "Authenticated can register"             ON tournament_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel their registration"    ON tournament_registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins full access registrations"       ON tournament_registrations FOR ALL    TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- streams
CREATE POLICY "Anyone can view live streams"      ON streams FOR SELECT                USING (true);
CREATE POLICY "Streamers can create streams"      ON streams FOR INSERT TO authenticated WITH CHECK (auth.uid() = streamer_id);
CREATE POLICY "Streamers can update own streams"  ON streams FOR UPDATE TO authenticated USING (auth.uid() = streamer_id);
CREATE POLICY "Admins full access streams"        ON streams FOR ALL    TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- stream_messages
CREATE POLICY "Anyone can view stream messages"   ON stream_messages FOR SELECT                USING (true);
CREATE POLICY "Authenticated can send messages"   ON stream_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access messages"       ON stream_messages FOR ALL    TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- store_items
CREATE POLICY "Anyone can view active store items" ON store_items FOR SELECT USING (is_active = true OR get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins manage store"                ON store_items FOR ALL    TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- inventory
CREATE POLICY "Users view own inventory" ON inventory FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add to inventory" ON inventory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all inventory"  ON inventory FOR ALL   TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- transactions
CREATE POLICY "Users view own transactions"     ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access transactions"   ON transactions FOR ALL   TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- notifications
CREATE POLICY "Users view own notifications"       ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users update own notifications"     ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins full access notifications"   ON notifications FOR ALL   TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- site_settings
CREATE POLICY "Anyone can view site settings"  ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage site settings"    ON site_settings FOR ALL   TO authenticated USING (get_user_role(auth.uid()) = 'admin');

-- ── Auth trigger: criar perfil automaticamente ────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── RPC helper: increment clan member count ───────────────────
CREATE OR REPLACE FUNCTION increment_clan_member_count(clan_id_param uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE clans SET member_count = member_count + 1 WHERE id = clan_id_param;
$$;

-- ── SEED DATA ─────────────────────────────────────────────────

-- Ranks
INSERT INTO ranks (name, icon, color, min_xp, sort_order) VALUES
  ('Bronze',     '🥉', '#cd7f32', 0,     1),
  ('Prata',      '🥈', '#c0c0c0', 500,   2),
  ('Ouro',       '🥇', '#ffd700', 1500,  3),
  ('Platina',    '💎', '#e5e4e2', 3000,  4),
  ('Diamante',   '💠', '#b9f2ff', 6000,  5),
  ('Mestre',     '⚡', '#ff6b35', 10000, 6),
  ('Grão-Mestre','👑', '#ff0000', 20000, 7);

-- Tags de membros
INSERT INTO member_tags (name, variant, icon, description, sort_order, is_active) VALUES
  ('Fundador',   'fundador',   '👑', 'Criador e fundador da plataforma',      1, true),
  ('Dono',       'dono',       '🔥', 'Proprietário da plataforma',            2, true),
  ('Admin',      'admin',      '🛡️', 'Administrador com acesso total',        3, true),
  ('Moderador',  'moderador',  '⚔️', 'Moderador de conteúdo e chat',         4, true),
  ('VIP',        'vip',        '⭐', 'Membro com acesso VIP exclusivo',       5, true),
  ('Booster',    'booster',    '⚡', 'Impulsionou o servidor',                6, true),
  ('Membro OG',  'og',         '🏆', 'Membro original desde o início',       7, true),
  ('Streamer',   'streamer',   '📡', 'Streamer ativo da plataforma',          8, true);
