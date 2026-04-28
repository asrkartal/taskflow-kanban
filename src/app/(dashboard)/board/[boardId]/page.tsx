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

  if (!user) redirect("/login");

  // Fetch board
  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .eq("user_id", user.id)
    .single();

  if (!board) redirect("/dashboard");

  // Fetch columns with tasks
  const { data: columns } = await supabase
    .from("columns")
    .select("*")
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  // Fetch all tasks for this board's columns
  const columnIds = (columns || []).map((c) => c.id);
  let tasks: Array<{
    id: string;
    column_id: string;
    title: string;
    description: string | null;
    position: number;
    priority: string;
    label: string | null;
    created_at: string;
    updated_at: string;
  }> = [];

  if (columnIds.length > 0) {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .in("column_id", columnIds)
      .order("position", { ascending: true });
    tasks = data || [];
  }

  // Combine columns with their tasks
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
    />
  );
}
