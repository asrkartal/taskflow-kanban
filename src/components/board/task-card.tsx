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
} from "lucide-react";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
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

export const TaskCard = memo(function TaskCard({
  task,
  onUpdate,
  onDelete,
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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority || "medium"];
  const PriorityIcon = priority.icon;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "group rounded-lg border border-border/40 bg-card p-3 cursor-grab active:cursor-grabbing task-card-transition touch-none",
          "hover:border-primary/20",
          isDragging && "opacity-40 rotate-2 scale-105 shadow-2xl z-50"
        )}
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex items-start gap-2">
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title */}
            <p className="text-sm font-medium leading-snug">{task.title}</p>

            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-5 font-medium",
                  priority.color
                )}
              >
                <PriorityIcon className="h-2.5 w-2.5 mr-0.5" />
                {priority.label}
              </Badge>

              {/* Label */}
              {task.label && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5 font-medium"
                >
                  {task.label}
                </Badge>
              )}

              {/* Description indicator */}
              {task.description && (
                <MessageSquare className="h-3 w-3 text-muted-foreground/50" />
              )}
            </div>
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
      />
    </>
  );
});
