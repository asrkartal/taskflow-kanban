import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: boards } = await supabase
    .from("boards")
    .select("*, columns(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 md:p-8 h-full overflow-auto board-pattern">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{" "}
            <span className="text-primary">
              {user.email?.split("@")[0]}
            </span>
          </h1>
          <p className="text-muted-foreground">
            Select a board from the sidebar or create a new one to get started.
          </p>
        </div>

        {/* Board Grid */}
        {boards && boards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/board/${board.id}`}
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{board.title}</h3>
                    {board.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {board.description}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/60">
                    Created{" "}
                    {new Date(board.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            ))}

            {/* Create new board card */}
            <div className="rounded-xl border-2 border-dashed border-border/50 p-5 flex flex-col items-center justify-center gap-3 min-h-[160px] opacity-70">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground text-center">
                Use the + button in the sidebar<br />to create a new board
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <LayoutDashboard className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">No boards yet</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Create your first board to start organizing your tasks with
              TaskFlow&apos;s powerful Kanban board.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
