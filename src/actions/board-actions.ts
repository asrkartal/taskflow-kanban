'use server';

// ==========================================
// Board Server Actions
// ==========================================

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Board } from '@/types';

export async function getBoards(): Promise<Board[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getBoard(boardId: string): Promise<Board | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single();

  if (error) return null;
  return data;
}

export async function createBoard(title: string, description?: string): Promise<Board> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('boards')
    .insert({
      title,
      description: description || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Create default columns
  const defaultColumns = [
    { board_id: data.id, title: 'To Do', position: 1000, color: '#6366f1' },
    { board_id: data.id, title: 'In Progress', position: 2000, color: '#f59e0b' },
    { board_id: data.id, title: 'Done', position: 3000, color: '#10b981' },
  ];

  await supabase.from('columns').insert(defaultColumns);

  revalidatePath('/dashboard');
  return data;
}

export async function updateBoard(
  boardId: string,
  updates: Partial<Pick<Board, 'title' | 'description'>>
): Promise<Board> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('boards')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', boardId)
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/board/${boardId}`);
  return data;
}

export async function deleteBoard(boardId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId);

  if (error) throw error;
  revalidatePath('/dashboard');
}
