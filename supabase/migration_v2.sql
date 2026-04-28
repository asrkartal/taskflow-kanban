-- ==========================================
-- TaskFlow — Yeni Özellikler: Schema Migration
-- ==========================================
-- Bu SQL'i Supabase Dashboard → SQL Editor → New Query'ye yapıştırıp çalıştırın.

-- ==========================================
-- 1. Tasks tablosuna yeni sütunlar ekle
-- ==========================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee TEXT;

-- ==========================================
-- 2. Checklist Items tablosu
-- ==========================================

CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  position FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_task_id ON checklist_items(task_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_position ON checklist_items(position);

-- ==========================================
-- 3. Comments tablosu
-- ==========================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT DEFAULT 'User',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);

-- ==========================================
-- 4. RLS Politikaları — Checklist Items
-- ==========================================

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklist items in their boards"
  ON checklist_items FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN columns c ON t.column_id = c.id
      JOIN boards b ON c.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create checklist items in their boards"
  ON checklist_items FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN columns c ON t.column_id = c.id
      JOIN boards b ON c.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update checklist items in their boards"
  ON checklist_items FOR UPDATE
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN columns c ON t.column_id = c.id
      JOIN boards b ON c.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete checklist items in their boards"
  ON checklist_items FOR DELETE
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN columns c ON t.column_id = c.id
      JOIN boards b ON c.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- ==========================================
-- 5. RLS Politikaları — Comments
-- ==========================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments in their boards"
  ON comments FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN columns c ON t.column_id = c.id
      JOIN boards b ON c.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);
