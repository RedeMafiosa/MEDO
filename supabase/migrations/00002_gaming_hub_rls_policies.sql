
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- =====================
-- PROFILES
-- =====================
CREATE POLICY "Admins full access profiles" ON public.profiles
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM get_user_role(auth.uid()));

CREATE POLICY "Public can view profiles" ON public.profiles
  FOR SELECT TO anon USING (true);

-- =====================
-- RANKS
-- =====================
CREATE POLICY "Anyone can view ranks" ON public.ranks
  FOR SELECT USING (true);

CREATE POLICY "Admins manage ranks" ON public.ranks
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

-- =====================
-- CLANS
-- =====================
CREATE POLICY "Anyone can view clans" ON public.clans
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can create clans" ON public.clans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leaders can update their clan" ON public.clans
  FOR UPDATE TO authenticated USING (auth.uid() = leader_id);

CREATE POLICY "Admins full access clans" ON public.clans
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

CREATE POLICY "Leaders can delete their clan" ON public.clans
  FOR DELETE TO authenticated USING (auth.uid() = leader_id);

-- =====================
-- CLAN MEMBERS
-- =====================
CREATE POLICY "Anyone can view clan members" ON public.clan_members
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can join clans" ON public.clan_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave clans" ON public.clan_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins full access clan_members" ON public.clan_members
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

-- =====================
-- TOURNAMENTS
-- =====================
CREATE POLICY "Anyone can view tournaments" ON public.tournaments
  FOR SELECT USING (true);

CREATE POLICY "Admins manage tournaments" ON public.tournaments
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

CREATE POLICY "Authenticated can create tournaments" ON public.tournaments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Creators can update their tournament" ON public.tournaments
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- =====================
-- TOURNAMENT REGISTRATIONS
-- =====================
CREATE POLICY "Anyone can view registrations" ON public.tournament_registrations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can register" ON public.tournament_registrations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their registration" ON public.tournament_registrations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins full access registrations" ON public.tournament_registrations
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

-- =====================
-- STREAMS
-- =====================
CREATE POLICY "Anyone can view live streams" ON public.streams
  FOR SELECT USING (true);

CREATE POLICY "Streamers can create streams" ON public.streams
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = streamer_id);

CREATE POLICY "Streamers can update own streams" ON public.streams
  FOR UPDATE TO authenticated USING (auth.uid() = streamer_id);

CREATE POLICY "Admins full access streams" ON public.streams
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

-- =====================
-- STREAM MESSAGES
-- =====================
CREATE POLICY "Anyone can view stream messages" ON public.stream_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can send messages" ON public.stream_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins full access messages" ON public.stream_messages
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

-- =====================
-- STORE ITEMS
-- =====================
CREATE POLICY "Anyone can view active store items" ON public.store_items
  FOR SELECT USING (is_active = true OR get_user_role(auth.uid()) = 'admin'::public.user_role);

CREATE POLICY "Admins manage store" ON public.store_items
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

-- =====================
-- INVENTORY
-- =====================
CREATE POLICY "Users view own inventory" ON public.inventory
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins view all inventory" ON public.inventory
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

CREATE POLICY "Users can add to inventory" ON public.inventory
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =====================
-- TRANSACTIONS
-- =====================
CREATE POLICY "Users view own transactions" ON public.transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins full access transactions" ON public.transactions
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

-- =====================
-- NOTIFICATIONS
-- =====================
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins full access notifications" ON public.notifications
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

CREATE POLICY "Authenticated can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- =====================
-- SITE SETTINGS
-- =====================
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins manage site settings" ON public.site_settings
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::public.user_role);
