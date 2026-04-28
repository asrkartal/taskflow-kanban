'use server';

// ==========================================
// Task Server Actions
// ==========================================

import { createClient } from '@/lib/supabase/server';

import type { Task, TaskPriority } from '@/types';
import { getEndPosition } from '@/lib/sorting';

export async function getTasksByColumn(columnId: string): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('column_id', columnId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTasksByBoard(boardId: string): Promise<Task[]> {
  const supabase = await createClient();

  // Get all columns for this board, then get all tasks for those columns
  const { data: columns } = await supabase
    .from('columns')
    .select('id')
    .eq('board_id', boardId);

  if (!columns || columns.length === 0) return [];

  const columnIds = columns.map((c) => c.id);

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .in('column_id', columnIds)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createTask(
  columnId: string,
  title: string,
  description?: string,
  priority: TaskPriority = 'medium'
): Promise<Task> {
  const supabase = await createClient();

  // Get existing tasks to calculate position
  const existingTasks = await getTasksByColumn(columnId);
  const position = getEndPosition(existingTasks);

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      column_id: columnId,
      title,
      description: description || null,
      position,
      priority,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'label' | 'column_id' | 'position'>>
): Promise<Task> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

export async function moveTask(
  taskId: string,
  targetColumnId: string,
  newPosition: number
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tasks')
    .update({
      column_id: targetColumnId,
      position: newPosition,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) throw error;
}
