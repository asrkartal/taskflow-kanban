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
  const [activeColumn, setActiveColumn] = useState<(Column & { tasks: Task[] }) | null>(null);
  const supabase = createClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Keep a ref to the latest columns to prevent stale closures in drag handlers
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

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

  // Find which column contains a task using the REF (always latest state)
  const findColumnByTaskId = useCallback((taskId: string) => {
    return columnsRef.current.find((col) =>
      col.tasks.some((task) => task.id === taskId)
    );
  }, []);

  // ============================================================
  // Drag Handlers
  // ============================================================

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const dragId = active.id as string;

    // Check if dragging a column
    const draggedCol = columnsRef.current.find(c => c.id === dragId);
    if (draggedCol) {
      setActiveColumn(draggedCol);
      setActiveTask(null);
      return;
    }

    // Otherwise dragging a task
    const col = findColumnByTaskId(dragId);
    if (col) {
      const task = col.tasks.find((t) => t.id === dragId);
      if (task) {
        setActiveTask(task);
        setActiveColumn(null);
      }
    }
  }, [findColumnByTaskId]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dragging a column, skip DragOver (columns handle reorder in DragEnd)
    if (columnsRef.current.some(c => c.id === activeId)) return;

    const sourceCol = findColumnByTaskId(activeId);
    let destCol = findColumnByTaskId(overId);

    if (!destCol) {
      destCol = columnsRef.current.find((col) => col.id === overId);
    }

    if (!sourceCol || !destCol || sourceCol.id === destCol.id) return;

    setColumns((prev) => {
      const newColumns = prev.map((col) => ({ ...col, tasks: [...col.tasks] }));
      const sourceIndex = newColumns.findIndex((c) => c.id === sourceCol.id);
      const destIndex = newColumns.findIndex((c) => c.id === destCol.id);

      const taskIndex = newColumns[sourceIndex].tasks.findIndex((t) => t.id === activeId);
      if (taskIndex === -1) return prev;

      const [movedTask] = newColumns[sourceIndex].tasks.splice(taskIndex, 1);
      const overTaskIndex = newColumns[destIndex].tasks.findIndex((t) => t.id === overId);

      if (overTaskIndex >= 0) {
        newColumns[destIndex].tasks.splice(overTaskIndex, 0, { ...movedTask, column_id: destCol.id });
      } else {
        newColumns[destIndex].tasks.push({ ...movedTask, column_id: destCol.id });
      }

      return newColumns;
    });
  }, [findColumnByTaskId]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Use latest state from ref
    const currentCols = columnsRef.current;

    // ── Column reorder ──
    const isColumnDrag = currentCols.some(c => c.id === activeId);
    if (isColumnDrag) {
      const activeColIndex = currentCols.findIndex(c => c.id === activeId);
      const overColIndex = currentCols.findIndex(c => c.id === overId);

      if (activeColIndex !== -1 && overColIndex !== -1 && activeColIndex !== overColIndex) {
        const newCols = [...currentCols];
        const [moved] = newCols.splice(activeColIndex, 1);
        newCols.splice(overColIndex, 0, moved);

        // Recalculate positions
        const updatedCols = newCols.map((col, i) => ({ ...col, position: (i + 1) * 1000 }));
        setColumns(updatedCols);

        // Persist all column positions
        try {
          for (const col of updatedCols) {
            await supabase
              .from("columns")
              .update({ position: col.position, updated_at: new Date().toISOString() })
              .eq("id", col.id);
          }
        } catch {
          toast.error("Failed to save column order");
          setColumns(initialColumns);
        }
      }
      return;
    }

    // ── Task reorder ──
    const destCol = currentCols.find(col => col.tasks.some(t => t.id === activeId));
    if (!destCol) return;

    const tasksInCol = destCol.tasks.filter((t) => t.id !== activeId);
    const finalOverIndex = tasksInCol.findIndex((t) => t.id === overId);

    let newPosition: number;
    if (finalOverIndex === -1) {
      newPosition = getEndPosition(tasksInCol);
    } else {
      newPosition = getPositionAtIndex(tasksInCol, finalOverIndex);
    }

    const activeIndex = destCol.tasks.findIndex((t) => t.id === activeId);
    const overIndex = destCol.tasks.findIndex((t) => t.id === overId);

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== destCol.id) return col;
          const newTasks = [...col.tasks];
          const [moved] = newTasks.splice(activeIndex, 1);
          moved.position = newPosition;
          newTasks.splice(overIndex, 0, moved);
          return { ...col, tasks: newTasks };
        })
      );
    } else {
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

    // Persist task position
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          column_id: destCol.id,
          position: newPosition,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeId);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
    } catch {
      toast.error("Failed to save task position");
      setColumns(initialColumns);
    }
  }, [supabase, initialColumns]);

  // ============================================================
  // Task CRUD Operations
  // ============================================================

  const handleAddTask = useCallback(
    async (columnId: string, title: string, priority: string = "medium", label?: string) => {
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
        priority: priority as any,
        label: label || null,
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
            priority,
            label: label || null,
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
        // Remove relational fields that are not columns in the tasks table
        const { checklist_items, comments, ...dbUpdates } = updates;

        // If there are no actual fields to update on the task row itself, skip DB call
        if (Object.keys(dbUpdates).length === 0) return;

        const { error } = await supabase
          .from("tasks")
          .update({
            ...dbUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskId);

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
      } catch (err) {
        console.error(err);
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
            {activeColumn ? (
              <div className="w-[320px] rounded-xl bg-card/80 border border-primary/30 p-4 shadow-2xl opacity-90 backdrop-blur-xl">
                <h3 className="text-sm font-semibold">{activeColumn.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{activeColumn.tasks.length} tasks</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
