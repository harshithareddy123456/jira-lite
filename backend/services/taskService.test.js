// Mock the models before importing the service
jest.mock("../models", () => ({
  Task: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  },
}));

// Now import the service after mocking
const TaskService = require("./taskService");
const { Task } = require("../models");

describe("Task Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllTasks", () => {
    it("should return all tasks with pagination", async () => {
      const mockTasks = [
        {
          id: 1,
          taskId: "IP-001",
          title: "Test Task 1",
          status: "To Do",
          createdAt: new Date(),
        },
        {
          id: 2,
          taskId: "IP-002",
          title: "Test Task 2",
          status: "In Progress",
          createdAt: new Date(),
        },
      ];

      Task.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockTasks,
      });

      const result = await TaskService.getAllTasks(
        { category: null, priority: null, status: null, search: null },
        { page: 1, limit: 10 },
      );

      expect(result.tasks).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pages).toBe(1);
    });

    it("should filter tasks by category", async () => {
      Task.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [
          {
            id: 1,
            category: "Coding Patterns",
            title: "Test Task",
          },
        ],
      });

      const result = await TaskService.getAllTasks(
        {
          category: "Coding Patterns",
          priority: null,
          status: null,
          search: null,
        },
        { page: 1, limit: 10 },
      );

      expect(result.tasks).toHaveLength(1);
      expect(Task.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: "Coding Patterns" }),
        }),
      );
    });

    it("should filter tasks by status", async () => {
      Task.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, status: "Done" }],
      });

      await TaskService.getAllTasks(
        { category: null, priority: null, status: "Done", search: null },
        { page: 1, limit: 10 },
      );

      expect(Task.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "Done" }),
        }),
      );
    });

    it("should handle pagination correctly", async () => {
      Task.findAndCountAll.mockResolvedValue({
        count: 50,
        rows: [],
      });

      const result = await TaskService.getAllTasks(
        { category: null, priority: null, status: null, search: null },
        { page: 3, limit: 10 },
      );

      expect(result.pagination.page).toBe(3);
      expect(result.pagination.pages).toBe(5);
      expect(Task.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 20,
          limit: 10,
        }),
      );
    });

    it("should search in title and description", async () => {
      Task.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, title: "Search result" }],
      });

      await TaskService.getAllTasks(
        { category: null, priority: null, status: null, search: "test" },
        { page: 1, limit: 10 },
      );

      expect(Task.findAndCountAll).toHaveBeenCalled();
      const callArgs = Task.findAndCountAll.mock.calls[0][0];
      expect(callArgs.where).toBeTruthy();
    });
  });

  describe("getTaskById", () => {
    it("should return a task by ID", async () => {
      const mockTask = {
        id: 1,
        taskId: "IP-001",
        title: "Test Task",
      };

      Task.findByPk.mockResolvedValue(mockTask);

      const result = await TaskService.getTaskById(1);

      expect(result).toEqual(mockTask);
      expect(Task.findByPk).toHaveBeenCalledWith(1);
    });

    it("should throw error if task not found", async () => {
      Task.findByPk.mockResolvedValue(null);

      await expect(TaskService.getTaskById(999)).rejects.toThrow(
        "Task not found",
      );
    });
  });

  describe("createTask", () => {
    it("should create a new task", async () => {
      const newTask = {
        id: 1,
        taskId: "IP-001",
        title: "New Task",
        category: "Coding Patterns",
        priority: "High",
        status: "To Do",
        storyPoints: 5,
      };

      Task.create.mockResolvedValue(newTask);

      const result = await TaskService.createTask({
        taskId: "IP-001",
        title: "New Task",
        category: "Coding Patterns",
        priority: "High",
        status: "To Do",
        storyPoints: 5,
      });

      expect(result).toEqual(newTask);
      expect(Task.create).toHaveBeenCalled();
    });

    it("should set default storyPoints to 1 if not provided", async () => {
      Task.create.mockResolvedValue({ storyPoints: 1 });

      await TaskService.createTask({
        taskId: "IP-001",
        title: "Task",
        category: "Coding Patterns",
        priority: "High",
        status: "To Do",
      });

      expect(Task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          storyPoints: 1,
        }),
      );
    });
  });

  describe("updateTask", () => {
    it("should update an existing task", async () => {
      const mockTask = {
        id: 1,
        taskId: "IP-001",
        title: "Old Title",
        description: "",
        category: "Coding Patterns",
        priority: "High",
        status: "To Do",
        storyPoints: 5,
        save: jest.fn().mockResolvedValue({
          id: 1,
          title: "Updated Title",
        }),
      };

      Task.findByPk.mockResolvedValue(mockTask);

      const result = await TaskService.updateTask(1, {
        title: "Updated Title",
      });

      expect(mockTask.save).toHaveBeenCalled();
      expect(mockTask.title).toBe("Updated Title");
    });

    it("should throw error if task not found for update", async () => {
      Task.findByPk.mockResolvedValue(null);

      await expect(
        TaskService.updateTask(999, { title: "Updated" }),
      ).rejects.toThrow("Task not found");
    });
  });

  describe("deleteTask", () => {
    it("should delete an existing task", async () => {
      const existingTask = {
        id: 1,
        taskId: "IP-001",
        destroy: jest.fn().mockResolvedValue(),
      };

      Task.findByPk.mockResolvedValue(existingTask);

      await TaskService.deleteTask(1);

      expect(existingTask.destroy).toHaveBeenCalled();
    });

    it("should throw error if task not found for delete", async () => {
      Task.findByPk.mockResolvedValue(null);

      await expect(TaskService.deleteTask(999)).rejects.toThrow(
        "Task not found",
      );
    });
  });

  describe("getTaskStats", () => {
    it("should return task statistics", async () => {
      Task.findAll.mockResolvedValue([
        { status: "To Do", count: 2, totalStoryPoints: 5 },
        { status: "In Progress", count: 3, totalStoryPoints: 8 },
        { status: "Done", count: 1, totalStoryPoints: 10 },
      ]);

      const result = await TaskService.getTaskStats();

      expect(result).toBeTruthy();
      expect(result).toHaveProperty("byStatus");
    });
  });
});
