import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TaskCard from "./TaskCard";
import {
  setFilterCategory,
  setFilterPriority,
  setSearchTerm,
  setDebouncedSearchTerm,
} from "../store/slices/uiSlice";
import { fetchTasks, updateTask } from "../store/slices/taskSlice";
import { RootState, AppDispatch } from "../store";
import { Task } from "../api/taskAPI";
import "./TaskBoard.css";

function TaskBoard() {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((state: RootState) => state.tasks.items);
  const { filterCategory, filterPriority, searchTerm, debouncedSearchTerm } =
    useSelector((state: RootState) => state.ui);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setDebouncedSearchTerm(searchTerm));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  useEffect(() => {
    const filters: any = {};
    if (filterCategory !== "All") filters.category = filterCategory;
    if (filterPriority !== "All") filters.priority = filterPriority;
    if (debouncedSearchTerm) filters.search = debouncedSearchTerm;

    dispatch(fetchTasks(filters));
  }, [filterCategory, filterPriority, debouncedSearchTerm, dispatch]);

  const categories = [
    "All",
    "Coding Patterns",
    "JavaScript Advanced",
    "NodeJS and ExpressJS",
    "Problem Solving and Coding",
    "React Deep Dive",
    "Redux",
    "TypeScript",
    "Web Development",
    "System Design",
  ];
  const priorities = ["All", "Low", "Medium", "High"];
  const statuses = ["To Do", "In Progress", "Done"];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (status: string) => {
    if (draggedTask && draggedTask.status !== status) {
      dispatch(updateTask({ id: draggedTask.id, data: { status } as Partial<Task> }));
    }
    setDraggedTask(null);
  };

  const getTotalTime = () => {
    return tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0) * 7;
  };

  const getCompletedTime = () => {
    return (
      tasks
        .filter((t) => t.status === "Done")
        .reduce((sum, task) => sum + (task.storyPoints || 0), 0) * 7
    );
  };

  const getTotalDays = () => Math.round(getTotalTime() / 24);
  const getRemainingDays = () =>
    Math.round((getTotalTime() - getCompletedTime()) / 24);

  const getStatusHours = (status: string) => {
    return getTasksByStatus(status).reduce(
      (sum, task) => sum + (task.storyPoints || 0) * 7,
      0
    );
  };

  return (
    <div className="task-board">
      <div className="board-header">
        <div className="header-info">
          <h2>Jira-Style Kanban Tracker</h2>
          <div className="story-point-selector">
            <label>Story Point = Hours:</label>
            <select className="hours-select">
              <option>7 hours</option>
              <option>8 hours</option>
              <option>5 hours</option>
            </select>
          </div>
        </div>
        <div className="stats-section">
          <div className="stat-box stat-total">
            <p>Total Days required to complete the syllabus:</p>
            <h3>{getTotalDays()} days</h3>
          </div>
          <div className="stat-box stat-remaining">
            <p>Remaining days to complete the syllabus:</p>
            <h3>{getRemainingDays()} days</h3>
          </div>
          <div className="placement-info">
            <p>When moving card back to Todo, place at:</p>
            <select className="placement-select">
              <option>Bottom (last position)</option>
              <option>Top (first position)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="🔍 Search tasks by title or description..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="search-clear"
              onClick={() => dispatch(setSearchTerm(""))}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => dispatch(setFilterCategory(e.target.value))}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Priority:</label>
          <select
            value={filterPriority}
            onChange={(e) => dispatch(setFilterPriority(e.target.value))}
            className="filter-select"
          >
            {priorities.map((pri) => (
              <option key={pri} value={pri}>
                {pri}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="board-container">
        {statuses.map((status) => (
          <div
            key={status}
            className="status-column"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(status)}
          >
            <h2
              className={`column-header header-${status.toLowerCase().replace(" ", "-")}`}
            >
              {status === "To Do" && "📋"} {status === "In Progress" && "⚙️"}{" "}
              {status === "Done" && "✅"} {status}
              <span className="task-count">
                {getTasksByStatus(status).length}
              </span>
              {status === "To Do" && (
                <span className="status-duration">
                  {getStatusHours("To Do")}h to go
                </span>
              )}
              {status === "In Progress" && (
                <span className="status-duration">
                  {getStatusHours("In Progress")}h remaining
                </span>
              )}
            </h2>
            <div className="task-list">
              {getTasksByStatus(status).length === 0 ? (
                <p className="empty-message">
                  {status === "Done"
                    ? "Completed tasks will appear here"
                    : "No tasks"}
                </p>
              ) : (
                getTasksByStatus(status).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    availableStatuses={statuses}
                    onDragStart={handleDragStart}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskBoard;
