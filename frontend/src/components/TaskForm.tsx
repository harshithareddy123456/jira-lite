import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTask, updateTask } from "../store/slices/taskSlice";
import { closeModal, clearEditingTask } from "../store/slices/uiSlice";
import { RootState, AppDispatch } from "../store";
import { Task } from "../api/taskAPI";
import "./TaskForm.css";

interface FormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  storyPoints: number;
}

function TaskForm() {
  const dispatch = useDispatch<AppDispatch>();
  const editingTask = useSelector((state: RootState) => state.ui.editingTask);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "Coding Patterns",
    priority: "Medium",
    status: "To Do",
    storyPoints: 1,
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        category: editingTask.category,
        priority: editingTask.priority,
        status: editingTask.status,
        storyPoints: editingTask.storyPoints,
      });
    }
  }, [editingTask]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "storyPoints" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.title.trim()) {
      if (editingTask) {
        dispatch(
          updateTask({
            id: editingTask.id,
            data: formData as Partial<Task>,
          })
        );
      } else {
        const taskId = `IP-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
        dispatch(
          createTask({
            ...formData,
            taskId,
            storyPoints: parseInt(formData.storyPoints.toString()) || 1,
          })
        );
      }
      handleClose();
    }
  };

  const handleClose = () => {
    dispatch(closeModal());
    dispatch(clearEditingTask());
    setFormData({
      title: "",
      description: "",
      category: "Coding Patterns",
      priority: "Medium",
      status: "To Do",
      storyPoints: 1,
    });
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingTask ? "Edit Task" : "Create New Task"}</h2>
          <button className="btn-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description (optional)"
              rows={4}
              className="form-textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Coding Patterns">Coding Patterns</option>
                <option value="JavaScript Advanced">JavaScript Advanced</option>
                <option value="NodeJS and ExpressJS">
                  NodeJS and ExpressJS
                </option>
                <option value="Problem Solving and Coding">
                  Problem Solving and Coding
                </option>
                <option value="React Deep Dive">React Deep Dive</option>
                <option value="Redux">Redux</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Web Development">Web Development</option>
                <option value="System Design">System Design</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority *</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="storyPoints">Story Points</label>
            <input
              type="number"
              id="storyPoints"
              name="storyPoints"
              value={formData.storyPoints}
              onChange={handleChange}
              min="1"
              max="100"
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingTask ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
