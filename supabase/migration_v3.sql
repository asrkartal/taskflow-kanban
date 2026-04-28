-- ==========================================
-- TaskFlow — Migration V3: Public Sharing
-- ==========================================
-- Bu SQL'i Supabase Dashboard → SQL Editor → New Query'ye yapıştırıp çalıştırın.

-- ==========================================
-- 1. Boards tablosuna is_public ekle
-- ==========================================
ALTER TABLE boards ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- ==========================================
-- 2. Yeni RLS Politikaları (Okuma Yetkisi)
-- ==========================================

-- BOARDS: Herkes public board'ları okuyabilir
CREATE POLICY "Anyone can view public boards"
  ON boards FOR SELECT
  USING (is_public = true);

-- COLUMNS: Herkes public board'ların sütunlarını okuyabilir
CREATE POLICY "Anyone can view columns of public boards"
  ON columns FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards WHERE is_public = true
    )
  );

-- TASKS: Herkes public board'ların görevlerini okuyabilir
CREATE POLICY "Anyone can view tasks of public boards"
  ON tasks FOR SELECT
  USING (
    column_id IN (
      SELECT c.id FROM columns c
      JOIN boards b ON c.board_id = b.id
      WHERE b.is_public = true
    )
  );

-- CHECKLIST ITEMS: Herkes public board'ların checklistlerini okuyabilir
CREATE POLICY "Anyone can view checklist items of public boards"
  ON checklist_items FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN columns c ON t.column_id = c.id
      JOIN boards b ON c.board_id = b.id
      WHERE b.is_public = true
    )
  );

-- COMMENTS: Herkes public board'ların yorumlarını okuyabilir
CREATE POLICY "Anyone can view comments of public boards"
  ON comments FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN columns c ON t.column_id = c.id
      JOIN boards b ON c.board_id = b.id
      WHERE b.is_public = true
    )
  );

-- OWNER GÜNCELLEMESİ: Pano sahibi panosunun is_public değerini değiştirebilir.
-- Zaten "Users can update their own boards" politikası vardı, 
-- UPDATE komutunda ekstra policy yazmaya gerek yok (kendi panosunu zaten update edebiliyor).
