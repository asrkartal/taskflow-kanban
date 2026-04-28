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
  due_date?: string | null;
  assignee?: string | null;
  checklist_items?: ChecklistItem[];
  comments?: Comment[];
  created_at?: string;
  updated_at?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface ChecklistItem {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at?: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  author_name: string;
  created_at?: string;
}

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
  due_date?: string | null;
  assignee?: string | null;
  column_id?: string;
  position?: number;
}

export interface MoveTaskInput {
  taskId: string;
  targetColumnId: string;
  newPosition: number;
}
