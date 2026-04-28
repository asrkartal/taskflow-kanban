'use server';

// ==========================================
// Column Server Actions
// ==========================================

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Column } from '@/types';
import { getEndPosition } from '@/lib/sorting';

export async function getColumns(boardId: string): Promise<Column[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createColumn(
  boardId: string,
  title: string,
  color?: string
): Promise<Column> {
  const supabase = await createClient();

  // Get existing columns to calculate position
  const existingColumns = await getColumns(boardId);
  const position = getEndPosition(existingColumns);

  const { data, error } = await supabase
    .from('columns')
    .insert({
      board_id: boardId,
      title,
      position,
      color: color || '#6366f1',
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/board/${boardId}`);
  return data;
}

export async function updateColumn(
  columnId: string,
  updates: Partial<Pick<Column, 'title' | 'color' | 'position'>>
): Promise<Column> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('columns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', columnId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteColumn(
  columnId: string,
  boardId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('columns')
    .delete()
    .eq('id', columnId);

  if (error) throw error;
  revalidatePath(`/board/${boardId}`);
}

export async function updateColumnPosition(
  columnId: string,
  newPosition: number
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('columns')
    .update({ position: newPosition, updated_at: new Date().toISOString() })
    .eq('id', columnId);

  if (error) throw error;
}
