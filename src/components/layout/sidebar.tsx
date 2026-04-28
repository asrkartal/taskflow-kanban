"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Plus,
  Loader2,
  Trash2,
  X,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import type { Board } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editBoardTitle, setEditBoardTitle] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleUpdateBoard = async (boardId: string) => {
    if (!editBoardTitle.trim() || editBoardTitle.trim() === boards.find(b => b.id === boardId)?.title) {
      setEditingBoardId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("boards")
        .update({ title: editBoardTitle.trim() })
        .eq("id", boardId);

      if (error) throw error;

      setBoards((prev) =>
        prev.map((b) =>
          b.id === boardId ? { ...b, title: editBoardTitle.trim() } : b
        )
      );
      toast.success("Board renamed");
    } catch {
      toast.error("Failed to rename board");
    } finally {
      setEditingBoardId(null);
    }
  };

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("boards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setBoards(data || []);
      } catch {
        toast.error("Failed to load boards");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;
    setIsCreating(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("boards")
        .insert({
          title: newBoardTitle.trim(),
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create default columns
      await supabase.from("columns").insert([
        { board_id: data.id, title: "To Do", position: 1000, color: "#6366f1" },
        {
          board_id: data.id,
          title: "In Progress",
          position: 2000,
          color: "#f59e0b",
        },
        { board_id: data.id, title: "Done", position: 3000, color: "#10b981" },
      ]);

      setBoards((prev) => [...prev, data]);
      setNewBoardTitle("");
      setShowInput(false);
      toast.success("Board created!");
      router.push(`/board/${data.id}`);
    } catch {
      toast.error("Failed to create board");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from("boards")
        .delete()
        .eq("id", boardId);

      if (error) throw error;

      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      toast.success("Board deleted");

      if (pathname === `/board/${boardId}`) {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Failed to delete board");
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-14 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300 ease-in-out",
          "md:translate-x-0 md:static md:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Boards
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md hover:bg-sidebar-accent"
                onClick={() => setShowInput(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md hover:bg-sidebar-accent md:hidden"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Board List */}
          <ScrollArea className="flex-1 px-3 py-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : boards.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <LayoutDashboard className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No boards yet</p>
                <p className="text-xs text-muted-foreground/60">
                  Create your first board to get started
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {boards.map((board) => {
                  const isActive = pathname === `/board/${board.id}`;
                  return (
                    <div
                      key={board.id}
                      className={cn(
                        "group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4 shrink-0" />
                      
                      {editingBoardId === board.id ? (
                        <div className="flex-1 flex items-center gap-1">
                          <Input
                            value={editBoardTitle}
                            onChange={(e) => setEditBoardTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateBoard(board.id);
                              if (e.key === "Escape") setEditingBoardId(null);
                            }}
                            className="h-6 px-1.5 py-0 text-sm bg-background border-primary/30"
                            autoFocus
                            onBlur={() => handleUpdateBoard(board.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : (
                        <Link
                          href={`/board/${board.id}`}
                          prefetch={true}
                          onClick={() => onClose()}
                          className="text-sm font-medium truncate flex-1 block"
                        >
                          {board.title}
                        </Link>
                      )}

                      {!editingBoardId && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-primary/20"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingBoardId(board.id);
                              setEditBoardTitle(board.title);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteBoard(board.id, e);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* New Board Input */}
            {showInput && (
              <div className="mt-2 space-y-2">
                <Input
                  placeholder="Board title..."
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateBoard();
                    if (e.key === "Escape") {
                      setShowInput(false);
                      setNewBoardTitle("");
                    }
                  }}
                  className="h-8 text-sm bg-sidebar-accent/50 border-sidebar-border"
                  autoFocus
                  disabled={isCreating}
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={handleCreateBoard}
                    disabled={isCreating || !newBoardTitle.trim()}
                  >
                    {isCreating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setShowInput(false);
                      setNewBoardTitle("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-muted-foreground/50 text-center">
              TaskFlow v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
