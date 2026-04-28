"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Pencil,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Calendar,
  Tag,
} from "lucide-react";

import type { Task, TaskPriority } from "@/types";
import { cn } from "@/lib/utils";

interface TaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const priorityOptions: { value: TaskPriority; label: string; icon: React.ElementType; color: string }[] = [
  { value: "low", label: "Low", icon: ArrowDown, color: "text-emerald-400" },
  { value: "medium", label: "Medium", icon: AlertCircle, color: "text-amber-400" },
  { value: "high", label: "High", icon: ArrowUp, color: "text-red-400" },
];

export function TaskDialog({
  task,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: TaskDialogProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [label, setLabel] = useState(task.label || "");
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    const newDesc = description.trim() || null;
    if (newDesc !== task.description) {
      onUpdate(task.id, { description: newDesc });
    }
    setIsEditingDesc(false);
  };

  const handleSaveLabel = () => {
    const newLabel = label.trim() || null;
    if (newLabel !== task.label) {
      onUpdate(task.id, { label: newLabel });
    }
    setIsEditingLabel(false);
  };

  const handlePriorityChange = (value: string | null) => {
    if (value) {
      onUpdate(task.id, { priority: value as TaskPriority });
    }
  };


  const handleDelete = () => {
    onDelete(task.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-card/95 backdrop-blur-xl border-border/50 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTitle();
                      if (e.key === "Escape") {
                        setIsEditingTitle(false);
                        setEditTitle(task.title);
                      }
                    }}
                    className="text-lg font-semibold bg-transparent h-auto py-1"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={handleSaveTitle}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditTitle(task.title);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <DialogTitle
                  className="text-lg font-semibold cursor-pointer hover:text-primary/80 transition-colors flex items-center gap-2 group"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {task.title}
                  <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                </DialogTitle>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5 mt-4">
          {/* Priority & Label Row */}
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" />
                Priority
              </Label>
              <Select
                value={task.priority}
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger className="w-[130px] h-8 text-xs bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-1.5">
                        <opt.icon className={cn("h-3 w-3", opt.color)} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                Label
              </Label>
              {isEditingLabel ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveLabel();
                      if (e.key === "Escape") {
                        setIsEditingLabel(false);
                        setLabel(task.label || "");
                      }
                    }}
                    placeholder="Add label..."
                    className="h-8 text-xs w-[130px] bg-background/50"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleSaveLabel}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-background/50"
                  onClick={() => setIsEditingLabel(true)}
                >
                  {task.label ? (
                    <Badge variant="secondary" className="text-[10px]">
                      {task.label}
                    </Badge>
                  ) : (
                    "Add label"
                  )}
                </Button>
              )}
            </div>

            {task.created_at && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Created
                </Label>
                <p className="text-xs text-muted-foreground h-8 flex items-center">
                  {new Date(task.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          <Separator className="opacity-30" />

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Description</Label>
            </div>

            {isEditingDesc ? (
              <div className="space-y-2">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                  className="min-h-[120px] text-sm bg-background/50 resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleSaveDescription}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setIsEditingDesc(false);
                      setDescription(task.description || "");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "rounded-lg p-3 text-sm cursor-pointer transition-colors min-h-[80px]",
                  task.description
                    ? "bg-background/30 hover:bg-background/50"
                    : "bg-background/20 hover:bg-background/40 text-muted-foreground"
                )}
                onClick={() => setIsEditingDesc(true)}
              >
                {task.description || "Click to add a description..."}
              </div>
            )}
          </div>

          <Separator className="opacity-30" />

          {/* Actions */}
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
