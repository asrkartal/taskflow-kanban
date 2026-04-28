"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  User,
  Plus,
  CheckSquare,
  MessageSquare,
  Send,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskPriority, ChecklistItem, Comment } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  isReadOnly?: boolean;
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
  isReadOnly = false,
}: TaskDialogProps) {
  const supabase = createClient();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [label, setLabel] = useState(task.label || "");
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [dueDate, setDueDate] = useState(task.due_date || "");
  const [assignee, setAssignee] = useState(task.assignee || "");
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);



  // Checklist
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // Load checklist items, comments and user info
  useEffect(() => {
    if (!open) return;
    const loadData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        setCurrentUserEmail(user.email || "User");
      }

      // Load checklist items
      const { data: items } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("task_id", task.id)
        .order("position", { ascending: true });
      setChecklistItems(items || []);

      // Load comments
      const { data: cmts } = await supabase
        .from("comments")
        .select("*")
        .eq("task_id", task.id)
        .order("created_at", { ascending: false });
      setComments(cmts || []);
    };
    loadData();
  }, [open, task.id, supabase]);


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
    if (value) onUpdate(task.id, { priority: value as TaskPriority });
  };


  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDueDate(val);
    onUpdate(task.id, { due_date: val || null });
  };


  const handleSaveAssignee = () => {
    const val = assignee.trim() || null;
    onUpdate(task.id, { assignee: val });
    setIsEditingAssignee(false);
  };


  const handleAddChecklistItem = useCallback(async () => {
    if (!newChecklistItem.trim()) return;
    const position = checklistItems.length * 1000;
    const tempId = `temp-${Date.now()}`;
    const newItem: ChecklistItem = {
      id: tempId,
      task_id: task.id,
      title: newChecklistItem.trim(),
      is_completed: false,
      position,
    };
    const newItems = [...checklistItems, newItem];
    setChecklistItems(newItems);
    onUpdate(task.id, { checklist_items: newItems });
    setNewChecklistItem("");

    try {
      const { data, error } = await supabase
        .from("checklist_items")
        .insert({ task_id: task.id, title: newItem.title, position })
        .select()
        .single();
      if (error) throw error;
      const verifiedItems = newItems.map(i => i.id === tempId ? data : i);
      setChecklistItems(verifiedItems);
      onUpdate(task.id, { checklist_items: verifiedItems });
    } catch {
      toast.error("Failed to add checklist item");
      const rollback = newItems.filter(i => i.id !== tempId);
      setChecklistItems(rollback);
      onUpdate(task.id, { checklist_items: rollback });
    }
  }, [newChecklistItem, checklistItems, task.id, supabase, onUpdate]);

  const handleToggleChecklistItem = async (itemId: string, completed: boolean) => {
    const newItems = checklistItems.map(i => i.id === itemId ? { ...i, is_completed: completed } : i);
    setChecklistItems(newItems);
    onUpdate(task.id, { checklist_items: newItems });
    try {
      const { error } = await supabase
        .from("checklist_items")
        .update({ is_completed: completed })
        .eq("id", itemId);
      if (error) throw error;
    } catch {
      toast.error("Failed to update checklist item");
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    const newItems = checklistItems.filter(i => i.id !== itemId);
    setChecklistItems(newItems);
    onUpdate(task.id, { checklist_items: newItems });
    try {
      await supabase.from("checklist_items").delete().eq("id", itemId);
    } catch {
      toast.error("Failed to delete checklist item");
    }
  };

  const completedCount = checklistItems.filter(i => i.is_completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;


  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId) return;
    const tempId = `temp-${Date.now()}`;
    const newCmt: Comment = {
      id: tempId,
      task_id: task.id,
      user_id: currentUserId,
      content: newComment.trim(),
      author_name: currentUserEmail,
      created_at: new Date().toISOString(),
    };
    setComments(prev => [newCmt, ...prev]);
    setNewComment("");

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          task_id: task.id,
          user_id: currentUserId,
          content: newCmt.content,
          author_name: currentUserEmail,
        })
        .select()
        .single();
      if (error) throw error;
      setComments(prev => prev.map(c => c.id === tempId ? data : c));
    } catch {
      toast.error("Failed to add comment");
      setComments(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    try {
      await supabase.from("comments").delete().eq("id", commentId);
    } catch {
      toast.error("Failed to delete comment");
    }
  };


  const handleDelete = () => {
    onDelete(task.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] bg-card/95 backdrop-blur-xl border-border/50 p-0 overflow-hidden max-h-[90vh]">

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
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleSaveTitle}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => { setIsEditingTitle(false); setEditTitle(task.title); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <DialogTitle
                  className={cn(
                    "text-lg font-semibold transition-colors flex items-center gap-2 group",
                    !isReadOnly && "cursor-pointer hover:text-primary/80"
                  )}
                  onClick={() => !isReadOnly && setIsEditingTitle(true)}
                >
                  {task.title}
                  {!isReadOnly && <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />}
                </DialogTitle>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="px-6 pb-6 space-y-5 mt-4">

            <div className="flex flex-wrap gap-3">
              {/* Priority */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" /> Priority
                </Label>
                {isReadOnly ? (
                  <div className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-border/50 bg-background/30 text-xs">
                    {(() => {
                      const opt = priorityOptions.find(o => o.value === task.priority) || priorityOptions[1];
                      return (
                        <>
                          <opt.icon className={cn("h-3 w-3", opt.color)} />
                          {opt.label}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <Select value={task.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="w-[120px] h-8 text-xs bg-background/50">
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
                )}
              </div>

              {/* Label */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Tag className="h-3 w-3" /> Label
                </Label>
                {isEditingLabel && !isReadOnly ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveLabel();
                        if (e.key === "Escape") { setIsEditingLabel(false); setLabel(task.label || ""); }
                      }}
                      placeholder="Add label..."
                      className="h-8 text-xs w-[120px] bg-background/50"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveLabel}>
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("h-8 text-xs bg-background/50", isReadOnly && "pointer-events-none border-border/50 bg-background/30")}
                    onClick={() => !isReadOnly && setIsEditingLabel(true)}
                  >
                    {task.label ? <Badge variant="secondary" className="text-[10px]">{task.label}</Badge> : (isReadOnly ? "No label" : "Add label")}
                  </Button>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Due Date
                </Label>
                <Input
                  type="date"
                  value={dueDate ? dueDate.split("T")[0] : ""}
                  onChange={handleDueDateChange}
                  className={cn("h-8 text-xs w-[140px] bg-background/50", isReadOnly && "opacity-70")}
                  disabled={isReadOnly}
                />
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Assignee
                </Label>
                {isEditingAssignee && !isReadOnly ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveAssignee();
                        if (e.key === "Escape") { setIsEditingAssignee(false); setAssignee(task.assignee || ""); }
                      }}
                      placeholder="Name..."
                      className="h-8 text-xs w-[120px] bg-background/50"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveAssignee}>
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("h-8 text-xs bg-background/50", isReadOnly && "pointer-events-none border-border/50 bg-background/30")}
                    onClick={() => !isReadOnly && setIsEditingAssignee(true)}
                  >
                    {task.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                          {task.assignee.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs">{task.assignee}</span>
                      </div>
                    ) : (isReadOnly ? "Unassigned" : "Assign")}
                  </Button>
                )}
              </div>

              {/* Created */}
              {task.created_at && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Created
                  </Label>
                  <p className="text-xs text-muted-foreground h-8 flex items-center">
                    {new Date(task.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              )}
            </div>

            <Separator className="opacity-30" />


            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              {isEditingDesc && !isReadOnly ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a detailed description..."
                    className="min-h-[100px] text-sm bg-background/50 resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs" onClick={handleSaveDescription}>Save</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setIsEditingDesc(false); setDescription(task.description || ""); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm transition-colors min-h-[60px] whitespace-pre-wrap",
                    task.description ? (isReadOnly ? "bg-background/20" : "bg-background/30 hover:bg-background/50 cursor-pointer") : (isReadOnly ? "text-muted-foreground" : "bg-background/20 hover:bg-background/40 text-muted-foreground cursor-pointer")
                  )}
                  onClick={() => !isReadOnly && setIsEditingDesc(true)}
                >
                  {task.description || (isReadOnly ? "No description provided." : "Click to add a description...")}
                </div>
              )}
            </div>

            <Separator className="opacity-30" />


            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4" /> Checklist
                </Label>
                {totalCount > 0 && (
                  <span className="text-xs text-muted-foreground">{completedCount}/{totalCount}</span>
                )}
              </div>

              {totalCount > 0 && (
                <Progress value={progressPercent} className="h-1.5" />
              )}

              <div className="space-y-1.5">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group rounded-md px-2 py-1.5 hover:bg-background/30 transition-colors">
                    <Checkbox
                      checked={item.is_completed}
                      onCheckedChange={(checked) => !isReadOnly && handleToggleChecklistItem(item.id, !!checked)}
                      disabled={isReadOnly}
                      className="h-4 w-4"
                    />
                    <span className={cn("text-sm flex-1", item.is_completed && "line-through text-muted-foreground")}>
                      {item.title}
                    </span>
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteChecklistItem(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {!isReadOnly && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add an item..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddChecklistItem(); }}
                    className="h-7 text-xs bg-background/40 flex-1"
                  />
                  <Button size="sm" className="h-7 text-xs px-2" onClick={handleAddChecklistItem} disabled={!newChecklistItem.trim()}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <Separator className="opacity-30" />


            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" /> Comments
                {comments.length > 0 && (
                  <span className="text-xs text-muted-foreground font-normal">({comments.length})</span>
                )}
              </Label>


              {!isReadOnly && (
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {currentUserEmail ? currentUserEmail.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="flex-1 flex gap-1.5">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
                      className="h-8 text-xs bg-background/40 flex-1"
                    />
                    <Button size="sm" className="h-8 px-2.5" onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}


              {comments.length > 0 && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {comments.map((cmt) => (
                    <div key={cmt.id} className="flex gap-2 group rounded-lg p-2 hover:bg-background/20 transition-colors">
                      <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {cmt.author_name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium truncate">{cmt.author_name || "User"}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {cmt.created_at ? new Date(cmt.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80 mt-0.5 whitespace-pre-wrap">{cmt.content}</p>
                      </div>
                      {!isReadOnly && cmt.user_id === currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={() => handleDeleteComment(cmt.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="opacity-30" />


            {!isReadOnly && (
              <div className="flex justify-end">
                <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={handleDelete}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Task
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
