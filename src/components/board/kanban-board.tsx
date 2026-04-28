"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import { BoardColumn } from "./board-column";
import { DragOverlayCard } from "./drag-overlay-card";
import { AddColumnForm } from "./add-column-form";
import type { Column, Task } from "@/types";
import { getPositionAtIndex, getEndPosition } from "@/lib/sorting";
import { toast } from "sonner";

interface KanbanBoardProps {
  boardId: string;
  boardTitle: string;
  initialColumns: (Column & { tasks: Task[] })[];
}

export function KanbanBoard({
  boardId,
  boardTitle,
  initialColumns,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<(Column & { tasks: Task[] })[]>(
    initialColumns
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const supabase = createClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sensors for drag & drop (pointer + touch + keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Column IDs for SortableContext
  const columnIds = useMemo(
    () => columns.map((col) => col.id),
    [columns]
  );

  // Find which column contains a task
  const findColumnByTaskId = useCallback(
    (taskId: string) => {
      return columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );
    },
    [columns]
  );

  // ============================================================
  // Drag Handlers
  // ============================================================

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const taskId = active.id as string;

      // Find the task being dragged
      for (const col of columns) {
        const task = col.tasks.find((t) => t.id === taskId);
        if (task) {
          setActiveTask(task);
          break;
        }
      }
    },
    [columns]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Find source and destination columns
      const sourceCol = findColumnByTaskId(activeId);
      let destCol = findColumnByTaskId(overId);

      // If overId is a column ID (not a task ID), it means we're dragging over an empty column
      if (!destCol) {
        destCol = columns.find((col) => col.id === overId);
      }

      if (!sourceCol || !destCol || sourceCol.id === destCol.id) return;

      // Move task from source to destination (optimistic UI)
      setColumns((prev) => {
        const newColumns = prev.map((col) => ({
          ...col,
          tasks: [...col.tasks],
        }));

        const sourceIndex = newColumns.findIndex(
          (c) => c.id === sourceCol.id
        );
        const destIndex = newColumns.findIndex(
          (c) => c.id === destCol.id
        );

        // Remove task from source
        const taskIndex = newColumns[sourceIndex].tasks.findIndex(
          (t) => t.id === activeId
        );
        if (taskIndex === -1) return prev;

        const [movedTask] = newColumns[sourceIndex].tasks.splice(
          taskIndex,
          1
        );

        // Find the index to insert in the destination
        const overTaskIndex = newColumns[destIndex].tasks.findIndex(
          (t) => t.id === overId
        );

        if (overTaskIndex >= 0) {
          // Insert at the position of the over task
          newColumns[destIndex].tasks.splice(overTaskIndex, 0, {
            ...movedTask,
            column_id: destCol.id,
          });
        } else {
          // Insert at the end
          newColumns[destIndex].tasks.push({
            ...movedTask,
            column_id: destCol.id,
          });
        }

        return newColumns;
      });
    },
    [columns, findColumnByTaskId]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      const activeCol = findColumnByTaskId(activeId);
      if (!activeCol) return;

      const tasksInCol = activeCol.tasks.filter((t) => t.id !== activeId);
      const finalOverIndex = tasksInCol.findIndex((t) => t.id === overId);

      let newPosition: number;
      if (finalOverIndex === -1) {
        newPosition = getEndPosition(tasksInCol);
      } else {
        newPosition = getPositionAtIndex(tasksInCol, finalOverIndex);
      }

      const activeIndex = activeCol.tasks.findIndex((t) => t.id === activeId);
      const overIndex = activeCol.tasks.findIndex((t) => t.id === overId);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        // Reorder within the same column (optimistic UI)
        setColumns((prev) =>
          prev.map((col) => {
            if (col.id !== activeCol.id) return col;

            const newTasks = [...col.tasks];
            const [moved] = newTasks.splice(activeIndex, 1);
            moved.position = newPosition;
            newTasks.splice(overIndex, 0, moved);

            return { ...col, tasks: newTasks };
          })
        );
      } else {
        // If it was moved between columns in handleDragOver, we still need to update position
        setColumns((prev) =>
          prev.map((col) => {
            const hasTask = col.tasks.some((t) => t.id === activeId);
            if (!hasTask) return col;

            return {
              ...col,
              tasks: col.tasks.map((t) =>
                t.id === activeId ? { ...t, position: newPosition } : t
              ),
            };
          })
        );
      }

      // Persist to database
      try {
        const currentCol = columns.find((col) => col.id === activeCol.id);
        if (!currentCol) return;
        
        const task = currentCol.tasks.find((t) => t.id === activeId);
        if (!task) return;

        const { error } = await supabase
          .from("tasks")
          .update({
            column_id: currentCol.id,
            position: newPosition,
            updated_at: new Date().toISOString(),
          })
          .eq("id", activeId);

        if (error) throw error;
      } catch {
        toast.error("Failed to save task position");
        // Revert to initial state
        setColumns(initialColumns);
      }
    },
    [columns, findColumnByTaskId, supabase, initialColumns]
  );

  // ============================================================
  // Task CRUD Operations
  // ============================================================

  const handleAddTask = useCallback(
    async (columnId: string, title: string) => {
      const column = columns.find((c) => c.id === columnId);
      if (!column) return;

      const position = getEndPosition(column.tasks);
      const tempId = `temp-${Date.now()}`;

      // Optimistic update
      const newTask: Task = {
        id: tempId,
        column_id: columnId,
        title,
        description: null,
        position,
        priority: "medium",
        label: null,
      };

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col
        )
      );

      try {
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            column_id: columnId,
            title,
            position,
            priority: "medium",
          })
          .select()
          .single();

        if (error) throw error;

        // Replace temp task with real one
        setColumns((prev) =>
          prev.map((col) =>
            col.id === columnId
              ? {
                  ...col,
                  tasks: col.tasks.map((t) =>
                    t.id === tempId ? data : t
                  ),
                }
              : col
          )
        );
      } catch {
        toast.error("Failed to create task");
        // Remove temp task
        setColumns((prev) =>
          prev.map((col) =>
            col.id === columnId
              ? {
                  ...col,
                  tasks: col.tasks.filter((t) => t.id !== tempId),
                }
              : col
          )
        );
      }
    },
    [columns, supabase]
  );

  const handleUpdateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      // Optimistic update
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t
          ),
        }))
      );

      try {
        const { error } = await supabase
          .from("tasks")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskId);

        if (error) throw error;
      } catch {
        toast.error("Failed to update task");
        setColumns(initialColumns);
      }
    },
    [supabase, initialColumns]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      // Optimistic update
      const prevColumns = columns;
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        }))
      );

      try {
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", taskId);

        if (error) throw error;
        toast.success("Task deleted");
      } catch {
        toast.error("Failed to delete task");
        setColumns(prevColumns);
      }
    },
    [columns, supabase]
  );

  // ============================================================
  // Column CRUD Operations
  // ============================================================

  const handleAddColumn = useCallback(
    async (title: string, color: string) => {
      const position = getEndPosition(columns);
      const tempId = `temp-col-${Date.now()}`;

      // Optimistic update
      const newColumn: Column & { tasks: Task[] } = {
        id: tempId,
        board_id: boardId,
        title,
        position,
        color,
        tasks: [],
      };

      setColumns((prev) => [...prev, newColumn]);

      try {
        const { data, error } = await supabase
          .from("columns")
          .insert({
            board_id: boardId,
            title,
            position,
            color,
          })
          .select()
          .single();

        if (error) throw error;

        // Replace temp column with real one
        setColumns((prev) =>
          prev.map((col) =>
            col.id === tempId ? { ...data, tasks: [] } : col
          )
        );

        // Scroll to new column
        setTimeout(() => {
          scrollContainerRef.current?.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: "smooth",
          });
        }, 100);
      } catch {
        toast.error("Failed to create column");
        setColumns((prev) => prev.filter((c) => c.id !== tempId));
      }
    },
    [columns, boardId, supabase]
  );

  const handleUpdateColumn = useCallback(
    async (columnId: string, updates: Partial<Column>) => {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, ...updates } : col
        )
      );

      try {
        const { error } = await supabase
          .from("columns")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", columnId);

        if (error) throw error;
      } catch {
        toast.error("Failed to update column");
        setColumns(initialColumns);
      }
    },
    [supabase, initialColumns]
  );

  const handleDeleteColumn = useCallback(
    async (columnId: string) => {
      const prevColumns = columns;
      setColumns((prev) => prev.filter((c) => c.id !== columnId));

      try {
        const { error } = await supabase
          .from("columns")
          .delete()
          .eq("id", columnId);

        if (error) throw error;
        toast.success("Column deleted");
      } catch {
        toast.error("Failed to delete column");
        setColumns(prevColumns);
      }
    },
    [columns, supabase]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="px-4 md:px-6 py-3 border-b border-border/30 bg-background/50 backdrop-blur-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">{boardTitle}</h1>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {columns.length} columns
          </span>
        </div>
      </div>

      {/* Board Content */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 snap-scroll custom-scrollbar board-pattern"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full items-start">
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  tasks={column.tasks}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onUpdateColumn={handleUpdateColumn}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}
            </SortableContext>

            <AddColumnForm onAdd={handleAddColumn} />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <DragOverlayCard task={activeTask} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
