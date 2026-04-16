import React from "react";
import { useDispatch } from "react-redux";
import { setEditingTask, openModal } from "../store/slices/uiSlice";
import { deleteTask, updateTask } from "../store/slices/taskSlice";
import { AppDispatch } from "../store";
import { Task } from "../api/taskAPI";
import "./TaskCard.css";

interface TaskCardProps {
  task: Task;
  availableStatuses: string[];
  onDragStart: (task: Task) => void;
}

function TaskCard({ task, availableStatuses, onDragStart }: TaskCardProps) {
  const dispatch = useDispatch<AppDispatch>();

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "High":
        return "#ef4444";
      case "Medium":
        return "#f97316";
      case "Low":
        return "#22c55e";
      default:
        return "#3b82f6";
    }
  };

  const handleEdit = () => {
    dispatch(setEditingTask(task));
    dispatch(openModal());
  };

  const handleDelete = () => {
    dispatch(deleteTask(task.id));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus !== task.status) {
      dispatch(updateTask({ id: task.id, data: { status: newStatus } as Partial<Task> }));
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    onDragStart(task);
    (e.target as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).style.opacity = "1";
  };

  return (
    <div
      className="task-card"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="task-top">
        <span className="task-id">{task.taskId || "IP-001"}</span>
        <span className="task-story-points">{task.storyPoints || 0} SP</span>
      </div>

      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button
            className="btn-icon btn-edit"
            onClick={handleEdit}
            title="Edit task"
          >
            ✎
          </button>
          <button
            className="btn-icon btn-delete"
            onClick={handleDelete}
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-tags">
        <span className="tag">{task.category}</span>
      </div>

      <div className="task-meta">
        <span className="task-time">
          {task.storyPoints ? `${task.storyPoints * 7}h` : "0h"} remaining
        </span>
      </div>

      <div className="task-footer">
        <select
          value={task.status}
          onChange={handleStatusChange}
          className={`status-select status-${task.status
            .toLowerCase()
            .replace(" ", "-")}`}
        >
          {availableStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={task.priority}
          onChange={() => {}}
          className="priority-select"
          style={{ borderColor: getPriorityColor(task.priority) }}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
    </div>
  );
}

export default TaskCard;
