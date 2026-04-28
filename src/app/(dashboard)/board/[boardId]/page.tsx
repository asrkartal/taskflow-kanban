import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/board/kanban-board";
import type { Metadata } from "next";

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

export async function generateMetadata({
  params,
}: BoardPageProps): Promise<Metadata> {
  const { boardId } = await params;
  const supabase = await createClient();
  const { data: board } = await supabase
    .from("boards")
    .select("title")
    .eq("id", boardId)
    .single();

  return {
    title: board ? `${board.title} — TaskFlow` : "Board — TaskFlow",
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();


  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .single();

  if (!board) redirect("/dashboard");


  const isOwner = user && board.user_id === user.id;
  
  if (!board.is_public && !isOwner) {
    redirect("/login");
  }

  const isReadOnly = !isOwner;

  // Columns and tasks
  const { data: columns } = await supabase
    .from("columns")
    .select("*")
    .eq("board_id", boardId)
    .order("position", { ascending: true });


  const columnIds = (columns || []).map((c) => c.id);
  let tasks: Array<{
    id: string;
    column_id: string;
    title: string;
    description: string | null;
    position: number;
    priority: string;
    label: string | null;
    due_date: string | null;
    assignee: string | null;
    created_at: string;
    updated_at: string;
    checklist_items?: Array<{
      id: string;
      task_id: string;
      title: string;
      is_completed: boolean;
      position: number;
    }>;
  }> = [];

  if (columnIds.length > 0) {
    const { data } = await supabase
      .from("tasks")
      .select("*, checklist_items(*)")
      .in("column_id", columnIds)
      .order("position", { ascending: true });
    tasks = data || [];
  }


  const columnsWithTasks = (columns || []).map((col) => ({
    ...col,
    tasks: tasks
      .filter((t) => t.column_id === col.id)
      .sort((a, b) => a.position - b.position),
  }));

  return (
    <KanbanBoard
      boardId={boardId}
      boardTitle={board.title}
      initialColumns={columnsWithTasks}
      isReadOnly={isReadOnly}
      isPublic={board.is_public}
    />
  );
}
