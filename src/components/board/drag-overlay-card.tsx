"use client";

import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  AlertCircle,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";

interface DragOverlayCardProps {
  task: Task;
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

export function DragOverlayCard({ task }: DragOverlayCardProps) {
  const priority = priorityConfig[task.priority || "medium"];
  const PriorityIcon = priority.icon;

  return (
    <div className="drag-overlay rounded-lg border border-primary/30 bg-card p-3 w-[290px] md:w-[310px] cursor-grabbing">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm font-medium leading-snug">{task.title}</p>

          <div className="flex items-center gap-2 flex-wrap">
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

            {task.label && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 font-medium"
              >
                {task.label}
              </Badge>
            )}

            {task.description && (
              <MessageSquare className="h-3 w-3 text-muted-foreground/50" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
