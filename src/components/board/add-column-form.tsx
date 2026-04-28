"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

interface AddColumnFormProps {
  onAdd: (title: string, color: string) => void;
}

const columnColors = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
];

export function AddColumnForm({ onAdd }: AddColumnFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(columnColors[0]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), selectedColor);
    setTitle("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        className="min-w-[280px] h-[44px] border-dashed border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all shrink-0"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Column
      </Button>
    );
  }

  return (
    <div className="min-w-[300px] md:min-w-[320px] rounded-xl bg-card/50 border border-border/40 p-3 space-y-3 shrink-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">New Column</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            setIsOpen(false);
            setTitle("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Input
        placeholder="Column title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") {
            setIsOpen(false);
            setTitle("");
          }
        }}
        className="h-9 text-sm bg-background/50"
        autoFocus
      />

      {/* Color Picker */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Column color</p>
        <div className="flex gap-2 flex-wrap">
          {columnColors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full transition-all duration-150 ${
                selectedColor === color
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={handleSubmit}
          disabled={!title.trim()}
        >
          Create
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            setIsOpen(false);
            setTitle("");
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
