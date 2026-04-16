const taskService = require("../services/taskService");
const {
  validateTask,
  validateTaskUpdate,
  validatePagination,
} = require("../validators/taskValidator");

// Get all tasks with optional filtering and pagination
exports.getAllTasks = async (req, res) => {
  try {
    const { error, value } = validatePagination(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
        error: error.details.map((d) => d.message),
      });
    }

    const { page, limit, category, priority, status, search } = value;

    const result = await taskService.getAllTasks(
      { category, priority, status, search },
      { page, limit },
    );

    res.json({
      success: true,
      data: result.tasks,
      pagination: result.pagination,
      count: result.tasks.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

// Get single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await taskService.getTaskById(id);

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching task",
      error: error.message,
    });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const { error, value } = validateTask(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.details.map((d) => d.message),
      });
    }

    const task = await taskService.createTask(value);

    res.status(201).json({
      success: true,
      data: task,
      message: "Task created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating task",
      error: error.message,
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const { error, value } = validateTaskUpdate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.details.map((d) => d.message),
      });
    }

    const task = await taskService.updateTask(id, value);

    res.json({
      success: true,
      data: task,
      message: "Task updated successfully",
    });
  } catch (error) {
    if (error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(400).json({
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    await taskService.deleteTask(id);

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    if (error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(400).json({
      success: false,
      message: "Error deleting task",
      error: error.message,
    });
  }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
  try {
    const stats = await taskService.getTaskStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};
