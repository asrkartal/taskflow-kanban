"use client";

import { useState, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  GripVertical,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Column, Task } from "@/types";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string, title: string, priority?: string, label?: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateColumn: (columnId: string, updates: Partial<Column>) => void;
  onDeleteColumn: (columnId: string) => void;
  isReadOnly?: boolean;
}

export function BoardColumn({
  column,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateColumn,
  onDeleteColumn,
  isReadOnly = false,
}: BoardColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<string>("medium");
  const [newLabel, setNewLabel] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(column.id, newTaskTitle.trim(), newTaskPriority, newLabel.trim() || undefined);
    setNewTaskTitle("");
    setNewTaskPriority("medium");
    setNewLabel("");
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
      ref={setSortableRef}
      style={style}
      className={cn(
        "flex flex-col w-[300px] min-w-[300px] md:w-[320px] md:min-w-[320px] rounded-xl bg-card/50 border border-border/40 snap-item shrink-0 max-h-[calc(100vh-180px)]",
        "transition-all duration-200",
        isOver && "ring-2 ring-primary/30 bg-primary/5",
        isDragging && "opacity-40 scale-[0.97]"
      )}
    >
      {/* Column Color Indicator */}
      <div
        className="column-indicator w-full rounded-t-xl"
        style={{ backgroundColor: column.color }}
      />

      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {!isReadOnly && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-accent/50 text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          {isEditingTitle && !isReadOnly ? (
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
                className="h-7 px-2 text-sm font-semibold flex-1"
                autoFocus
              />
            </div>
          ) : (
            <h3
              className={cn(
                "font-semibold text-sm truncate px-1",
                !isReadOnly && "cursor-pointer hover:bg-accent/50 rounded transition-colors"
              )}
              onClick={() => !isReadOnly && setIsEditingTitle(true)}
            >
              {column.title}
            </h3>
          )}
          <span className="ml-2 text-xs font-medium text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded-full shrink-0">
            {tasks.length}
          </span>
        </div>

        {!isReadOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground shrink-0 ml-1 cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => setIsEditingTitle(true)}
                className="gap-2 cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteColumn(column.id)}
                className="text-destructive focus:text-destructive gap-2 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1 px-2 custom-scrollbar">
        <div
          ref={setDroppableRef}
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
                isReadOnly={isReadOnly}
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

      {/* Column Footer / Add Task */}
      <div className="p-2 border-t border-border/20 bg-background/30 rounded-b-xl mt-auto shrink-0">
        {!isAddingTask ? (
          !isReadOnly && (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground h-9 font-medium"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add a task
            </Button>
          )
        ) : (
          <div className="space-y-3 p-3 rounded-lg bg-background/50 border border-border/30 shadow-sm">
            <div className="space-y-2">
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
                className="h-8 text-sm bg-background/80"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Select
                  value={newTaskPriority}
                  onValueChange={(val) => { if (val) setNewTaskPriority(val); }}
                >
                  <SelectTrigger className="h-7 text-xs bg-background/80 border-border w-[120px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Label (optional)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="h-7 text-xs bg-background/80 flex-1"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
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
                className="h-7 text-xs flex-1"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                  setNewTaskPriority("medium");
                  setNewLabel("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
