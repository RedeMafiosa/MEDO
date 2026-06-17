
-- ── member_tags table ─────────────────────────────────────────────────
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

ALTER TABLE member_tags ENABLE ROW LEVEL SECURITY;

-- Everyone can read active tags
CREATE POLICY "member_tags_select_all"
  ON member_tags FOR SELECT
  USING (true);

-- Only admins (service role) can write
CREATE POLICY "member_tags_insert_admin"
  ON member_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "member_tags_update_admin"
  ON member_tags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "member_tags_delete_admin"
  ON member_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── Seed the 8 default tags ───────────────────────────────────────────
INSERT INTO member_tags (name, variant, icon, description, sort_order, is_active) VALUES
  ('Fundador',   'fundador',   '👑', 'Criador e fundador da plataforma',      1,  true),
  ('Dono',       'dono',       '🔥', 'Proprietário da plataforma',            2,  true),
  ('Admin',      'admin',      '🛡️', 'Administrador com acesso total',        3,  true),
  ('Moderador',  'moderador',  '⚔️', 'Moderador de conteúdo e chat',         4,  true),
  ('VIP',        'vip',        '⭐', 'Membro com acesso VIP exclusivo',       5,  true),
  ('Booster',    'booster',    '⚡', 'Impulsionou o servidor',                6,  true),
  ('Membro OG',  'og',         '🏆', 'Membro original desde o início',       7,  true),
  ('Streamer',   'streamer',   '📡', 'Streamer ativo da plataforma',          8,  true);
