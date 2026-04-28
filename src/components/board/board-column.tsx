"use client";

import { useState, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil,
  X,
  Check,
} from "lucide-react";
import type { Column, Task } from "@/types";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string, title: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateColumn: (columnId: string, updates: Partial<Column>) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function BoardColumn({
  column,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateColumn,
  onDeleteColumn,
}: BoardColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(column.id, newTaskTitle.trim());
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle.trim() !== column.title) {
      onUpdateColumn(column.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col w-[300px] min-w-[300px] md:w-[320px] md:min-w-[320px] rounded-xl bg-card/50 border border-border/40 snap-item shrink-0 max-h-[calc(100vh-180px)]",
        "transition-all duration-200",
        isOver && "ring-2 ring-primary/30 bg-primary/5"
      )}
    >
      {/* Column Color Indicator */}
      <div
        className="column-indicator w-full rounded-t-xl"
        style={{ backgroundColor: column.color }}
      />

      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setIsEditingTitle(false);
                    setEditTitle(column.title);
                  }
                }}
                className="h-7 text-sm font-semibold bg-transparent border-primary/30"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={handleSaveTitle}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => {
                  setIsEditingTitle(false);
                  setEditTitle(column.title);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold truncate">{column.title}</h3>
              <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md shrink-0">
                {tasks.length}
              </span>
            </>
          )}
        </div>

        {!isEditingTitle && (
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => setIsEditingTitle(true)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteColumn(column.id)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1 px-2 custom-scrollbar">
        <div
          ref={setNodeRef}
          className="space-y-2 pb-2 min-h-[40px]"
        >
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && !isAddingTask && (
            <div className="text-center py-6 text-xs text-muted-foreground/50">
              No tasks yet
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Task Form */}
      <div className="px-2 pb-2">
        {isAddingTask ? (
          <div className="space-y-2 p-2 rounded-lg bg-background/50 border border-border/30">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask();
                if (e.key === "Escape") {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }
              }}
              className="h-8 text-sm bg-transparent"
              autoFocus
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
              >
                Add Task
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground justify-start"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add a task
          </Button>
        )}
      </div>
    </div>
  );
}
