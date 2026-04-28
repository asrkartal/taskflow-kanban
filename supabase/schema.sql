-- ==========================================
-- TaskFlow - Supabase Database Schema
-- ==========================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run

-- ==========================================
-- 1. Create Tables
-- ==========================================

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Board',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Columns table
CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position FLOAT NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position FLOAT NOT NULL DEFAULT 0,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. Create Indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(position);
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position);

-- ==========================================
-- 3. Enable Row Level Security (RLS)
-- ==========================================

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. Create RLS Policies
-- ==========================================

-- Boards: Users can only CRUD their own boards
CREATE POLICY "Users can view their own boards"
  ON boards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards"
  ON boards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);

-- Columns: Users can CRUD columns in their boards
CREATE POLICY "Users can view columns in their boards"
  ON columns FOR SELECT
  USING (board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()));

CREATE POLICY "Users can create columns in their boards"
  ON columns FOR INSERT
  WITH CHECK (board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()));

CREATE POLICY "Users can update columns in their boards"
  ON columns FOR UPDATE
  USING (board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()))
  WITH CHECK (board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete columns in their boards"
  ON columns FOR DELETE
  USING (board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()));

-- Tasks: Users can CRUD tasks in their boards
CREATE POLICY "Users can view tasks in their boards"
  ON tasks FOR SELECT
  USING (
    column_id IN (
      SELECT c.id FROM columns c
      JOIN boards b ON c.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their boards"
  ON tasks FOR INSERT
  WITH CHECK (
    column_id IN (
      SELECT c.id FROM columns c
      JOIN boards b ON c.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their boards"
  ON tasks FOR UPDATE
  USING (
    column_id IN (
      SELECT c.id FROM columns c
      JOIN boards b ON c.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    column_id IN (
      SELECT c.id FROM columns c
      JOIN boards b ON c.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their boards"
  ON tasks FOR DELETE
  USING (
    column_id IN (
      SELECT c.id FROM columns c
      JOIN boards b ON c.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- ==========================================
-- 5. Auto-update 'updated_at' trigger
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_boards_updated_at
    BEFORE UPDATE ON boards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_columns_updated_at
    BEFORE UPDATE ON columns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
