// Mock modules before importing controller
jest.mock("../validators/taskValidator");
jest.mock("../services/taskService");

// Mock models before importing any service/controller
jest.mock("../models", () => ({
  Task: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  },
}));

const taskController = require("./taskController");
const taskService = require("../services/taskService");

describe("Task Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe("getAllTasks", () => {
    it("should return all tasks with pagination", async () => {
      const mockResult = {
        tasks: [
          { id: 1, title: "Task 1" },
          { id: 2, title: "Task 2" },
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          pages: 1,
        },
      };

      req.query = { page: 1, limit: 10 };

      taskService.getAllTasks.mockResolvedValue(mockResult);

      const validatePagination =
        require("../validators/taskValidator").validatePagination;
      validatePagination.mockReturnValue({
        error: null,
        value: {
          page: 1,
          limit: 10,
          category: null,
          priority: null,
          status: null,
          search: null,
        },
      });

      await taskController.getAllTasks(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.tasks,
        pagination: mockResult.pagination,
        count: 2,
      });
    });

    it("should handle validation errors", async () => {
      const validatePagination =
        require("../validators/taskValidator").validatePagination;
      validatePagination.mockReturnValue({
        error: {
          details: [{ message: "Invalid page" }],
        },
        value: null,
      });

      await taskController.getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid pagination parameters",
        error: ["Invalid page"],
      });
    });

    it("should handle service errors", async () => {
      const validatePagination =
        require("../validators/taskValidator").validatePagination;
      validatePagination.mockReturnValue({
        error: null,
        value: {
          page: 1,
          limit: 10,
          category: null,
          priority: null,
          status: null,
          search: null,
        },
      });

      taskService.getAllTasks.mockRejectedValue(new Error("Database error"));

      await taskController.getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error fetching tasks",
        error: "Database error",
      });
    });
  });

  describe("getTaskById", () => {
    it("should return a task by ID", async () => {
      const mockTask = { id: 1, title: "Test Task" };

      req.params = { id: 1 };
      taskService.getTaskById.mockResolvedValue(mockTask);

      await taskController.getTaskById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTask,
      });
    });

    it("should return 400 for invalid ID", async () => {
      req.params = { id: "invalid" };

      await taskController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid task ID",
      });
    });

    it("should return 404 when task not found", async () => {
      req.params = { id: 999 };
      taskService.getTaskById.mockRejectedValue(new Error("Task not found"));

      await taskController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Task not found",
      });
    });

    it("should handle service errors", async () => {
      req.params = { id: 1 };
      taskService.getTaskById.mockRejectedValue(new Error("Database error"));

      await taskController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createTask", () => {
    it("should create a new task", async () => {
      req.body = {
        title: "New Task",
        category: "Coding Patterns",
        priority: "High",
        status: "To Do",
        storyPoints: 5,
        taskId: "IP-001",
      };

      const validateTask = require("../validators/taskValidator").validateTask;
      validateTask.mockReturnValue({
        error: null,
        value: req.body,
      });

      const mockCreatedTask = { id: 1, ...req.body };
      taskService.createTask.mockResolvedValue(mockCreatedTask);

      await taskController.createTask(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedTask,
        message: "Task created successfully",
      });
    });

    it("should handle validation errors", async () => {
      req.body = { title: "AB" };

      const validateTask = require("../validators/taskValidator").validateTask;
      validateTask.mockReturnValue({
        error: {
          details: [{ message: "Title too short" }],
        },
        value: null,
      });

      await taskController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateTask", () => {
    it("should update an existing task", async () => {
      req.params = { id: 1 };
      req.body = { title: "Updated Task" };

      const validateTaskUpdate =
        require("../validators/taskValidator").validateTaskUpdate;
      validateTaskUpdate.mockReturnValue({
        error: null,
        value: req.body,
      });

      const mockUpdatedTask = { id: 1, ...req.body };
      taskService.updateTask.mockResolvedValue(mockUpdatedTask);

      await taskController.updateTask(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedTask,
        message: "Task updated successfully",
      });
    });

    it("should return 404 when task not found for update", async () => {
      req.params = { id: 999 };
      req.body = { title: "Updated Task" };

      const validateTaskUpdate =
        require("../validators/taskValidator").validateTaskUpdate;
      validateTaskUpdate.mockReturnValue({
        error: null,
        value: req.body,
      });

      taskService.updateTask.mockRejectedValue(new Error("Task not found"));

      await taskController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteTask", () => {
    it("should delete a task", async () => {
      req.params = { id: 1 };

      taskService.deleteTask.mockResolvedValue();

      await taskController.deleteTask(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Task deleted successfully",
      });
    });

    it("should return 404 when task not found for delete", async () => {
      req.params = { id: 999 };

      taskService.deleteTask.mockRejectedValue(new Error("Task not found"));

      await taskController.deleteTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getTaskStats", () => {
    it("should return task statistics", async () => {
      const mockStats = {
        total: 10,
        completed: 5,
        inProgress: 3,
        todo: 2,
      };

      taskService.getTaskStats.mockResolvedValue(mockStats);

      await taskController.getTaskStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });

    it("should handle service errors for stats", async () => {
      taskService.getTaskStats.mockRejectedValue(new Error("Database error"));

      await taskController.getTaskStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
