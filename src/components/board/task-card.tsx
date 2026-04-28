"use client";

import { useState, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskDialog } from "./task-dialog";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Clock,
  CheckSquare,
} from "lucide-react";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  isReadOnly?: boolean;
}

const priorityConfig = {
  low: {
    label: "Low",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: ArrowDown,
  },
  medium: {
    label: "Medium",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: ArrowUp,
  },
};

// Label color presets
const labelColors: Record<string, string> = {
  bug: "bg-red-500 text-white",
  feature: "bg-violet-500 text-white",
  design: "bg-pink-500 text-white",
  tasarım: "bg-pink-500 text-white",
  acil: "bg-red-600 text-white",
  urgent: "bg-red-600 text-white",
  backend: "bg-amber-500 text-white",
  frontend: "bg-sky-500 text-white",
  website: "bg-teal-500 text-white",
  blog: "bg-emerald-500 text-white",
  email: "bg-orange-500 text-white",
};

function getLabelColor(label: string): string {
  const lower = label.toLowerCase();
  for (const [key, color] of Object.entries(labelColors)) {
    if (lower.includes(key)) return color;
  }
  // Fallback: generate a color from label hash
  const hash = label.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const colors = [
    "bg-indigo-500 text-white",
    "bg-cyan-500 text-white",
    "bg-fuchsia-500 text-white",
    "bg-lime-600 text-white",
    "bg-rose-500 text-white",
    "bg-teal-500 text-white",
  ];
  return colors[hash % colors.length];
}

export const TaskCard = memo(function TaskCard({
  task,
  onUpdate,
  onDelete,
  isReadOnly = false,
}: TaskCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isReadOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority || "medium"];
  const PriorityIcon = priority.icon;

  // Due date
  const hasDueDate = !!task.due_date;
  const isDueDateOverdue = hasDueDate ? new Date(task.due_date!) < new Date() : false;
  const formattedDueDate = hasDueDate
    ? new Date(task.due_date!).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  // Checklist
  const checklistTotal = task.checklist_items?.length || 0;
  const checklistDone = task.checklist_items?.filter(i => i.is_completed).length || 0;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...(isReadOnly ? {} : attributes)}
        {...(isReadOnly ? {} : listeners)}
        className={cn(
          "group rounded-lg border border-border/40 bg-card p-3 task-card-transition touch-none",
          !isReadOnly && "cursor-grab active:cursor-grabbing hover:border-primary/20 hover:shadow-md",
          isReadOnly && "cursor-pointer hover:border-primary/10",
          isDragging && "opacity-40 rotate-2 scale-105 shadow-2xl z-50"
        )}
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="space-y-2">
          {/* Top: Label badge (colored, Trello-style) */}
          {task.label && (
            <Badge className={cn("text-[10px] px-2 py-0.5 rounded-sm font-semibold border-0", getLabelColor(task.label))}>
              {task.label}
            </Badge>
          )}

          {/* Title */}
          <p className="text-sm font-medium leading-snug">{task.title}</p>

          {/* Bottom meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority */}
              <Badge
                variant="outline"
                className={cn("text-[10px] px-1.5 py-0 h-5 font-medium", priority.color)}
              >
                <PriorityIcon className="h-2.5 w-2.5 mr-0.5" />
                {priority.label}
              </Badge>

              {/* Due Date */}
              {formattedDueDate && (
                <span className={cn(
                  "flex items-center gap-0.5 text-[10px]",
                  isDueDateOverdue ? "text-red-400" : "text-muted-foreground"
                )}>
                  <Clock className="h-3 w-3" />
                  {formattedDueDate}
                </span>
              )}

              {/* Description indicator */}
              {task.description && (
                <MessageSquare className="h-3 w-3 text-muted-foreground/50" />
              )}

              {/* Checklist progress */}
              {checklistTotal > 0 && (
                <span className={cn(
                  "flex items-center gap-0.5 text-[10px]",
                  checklistDone === checklistTotal ? "text-emerald-400" : "text-muted-foreground"
                )}>
                  <CheckSquare className="h-3 w-3" />
                  {checklistDone}/{checklistTotal}
                </span>
              )}
            </div>

            {/* Assignee avatar (right side) */}
            {task.assignee && (
              <div
                className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0"
                title={task.assignee}
              >
                {task.assignee.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Dialog */}
      <TaskDialog
        task={task}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isReadOnly={isReadOnly}
      />
    </>
  );
});
