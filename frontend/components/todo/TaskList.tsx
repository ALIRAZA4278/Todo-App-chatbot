"use client";

/**
 * TaskList component for displaying a list of tasks.
 * Per specs/ui/components.md
 */
import { Task } from "@/lib/api";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "./EmptyState";
import { TaskCardSkeleton } from "@/components/ui";
import { Button } from "@/components/ui";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onToggleComplete: (taskId: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onClick?: (task: Task) => void;
  onCreateClick: () => void;
}

export function TaskList({
  tasks,
  isLoading,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
  onCreateClick,
}: TaskListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <EmptyState
        action={
          <Button onClick={onCreateClick}>
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Task
          </Button>
        }
      />
    );
  }

  // Task list
  return (
    <div className="space-y-3 overflow-visible">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
