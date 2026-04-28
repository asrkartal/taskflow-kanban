"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { generateTaskDescription } from "@/actions/ai-actions";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AiEnhanceButtonProps {
  taskTitle: string;
  onGenerated: (description: string) => void;
}

export function AiEnhanceButton({
  taskTitle,
  onGenerated,
}: AiEnhanceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!taskTitle.trim()) {
      toast.error("Task title is required to generate a description");
      return;
    }

    setIsLoading(true);

    try {
      const description = await generateTaskDescription(taskTitle);
      onGenerated(description);
      toast.success("AI description generated!");
    } catch {
      toast.error("Failed to generate description");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        className="inline-flex items-center justify-center gap-1.5 h-7 text-xs px-3 rounded-md bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 hover:border-violet-500/40 hover:from-violet-500/20 hover:to-indigo-500/20 text-violet-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {isLoading ? "Generating..." : "AI Enhance"}
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">Generate a description using AI</p>
      </TooltipContent>
    </Tooltip>
  );
}
