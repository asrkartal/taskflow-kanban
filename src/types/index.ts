// ==========================================
// TaskFlow - Type Definitions
// ==========================================

export interface Board {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  columns?: Column[];
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  color: string;
  created_at?: string;
  updated_at?: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description?: string | null;
  position: number;
  priority: TaskPriority;
  label?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';

// Drag & Drop types
export interface DragItem {
  id: string;
  type: 'task' | 'column';
}

// Form types
export interface CreateBoardInput {
  title: string;
  description?: string;
}

export interface CreateColumnInput {
  board_id: string;
  title: string;
  color?: string;
}

export interface CreateTaskInput {
  column_id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  label?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  label?: string | null;
  column_id?: string;
  position?: number;
}

export interface MoveTaskInput {
  taskId: string;
  targetColumnId: string;
  newPosition: number;
}
