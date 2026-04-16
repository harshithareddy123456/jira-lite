const {
  validateTask,
  validateTaskUpdate,
  validatePagination,
} = require("./taskValidator");

describe("Task Validator", () => {
  describe("validateTask", () => {
    it("should validate a valid task", () => {
      const validTask = {
        title: "Test Task",
        description: "Test Description",
        category: "Coding Patterns",
        priority: "High",
        status: "To Do",
        storyPoints: 5,
        taskId: "IP-001",
      };

      const { error, value } = validateTask(validTask);
      expect(error).toBeUndefined();
      expect(value.title).toBe("Test Task");
    });

    it("should reject task with title too short", () => {
      const invalidTask = {
        title: "AB",
        description: "Test",
        category: "Coding Patterns",
        priority: "High",
        status: "To Do",
        storyPoints: 5,
        taskId: "IP-001",
      };

      const { error } = validateTask(invalidTask);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain("at least 3 characters");
    });

    it("should reject task with invalid category", () => {
      const invalidTask = {
        title: "Valid Title",
        description: "Test",
        category: "Invalid Category",
        priority: "High",
        status: "To Do",
        storyPoints: 5,
        taskId: "IP-001",
      };

      const { error } = validateTask(invalidTask);
      expect(error).toBeDefined();
    });

    it("should reject task with invalid priority", () => {
      const invalidTask = {
        title: "Valid Title",
        description: "Test",
        category: "Coding Patterns",
        priority: "Critical",
        status: "To Do",
        storyPoints: 5,
        taskId: "IP-001",
      };

      const { error } = validateTask(invalidTask);
      expect(error).toBeDefined();
    });

    it("should reject task with invalid status", () => {
      const invalidTask = {
        title: "Valid Title",
        description: "Test",
        category: "Coding Patterns",
        priority: "High",
        status: "Pending",
        storyPoints: 5,
        taskId: "IP-001",
      };

      const { error } = validateTask(invalidTask);
      expect(error).toBeDefined();
    });

    it("should reject task with storyPoints out of range", () => {
      const invalidTask = {
        title: "Valid Title",
        description: "Test",
        category: "Coding Patterns",
        priority: "High",
        status: "To Do",
        storyPoints: 150,
        taskId: "IP-001",
      };

      const { error } = validateTask(invalidTask);
      expect(error).toBeDefined();
    });

    it("should require taskId", () => {
      const invalidTask = {
        title: "Valid Title",
        description: "Test",
        category: "Coding Patterns",
        priority: "High",
        status: "To Do",
        storyPoints: 5,
      };

      const { error } = validateTask(invalidTask);
      expect(error).toBeDefined();
    });
  });

  describe("validateTaskUpdate", () => {
    it("should validate a valid partial task update", () => {
      const updateData = {
        title: "Updated Title",
        priority: "Medium",
      };

      const { error, value } = validateTaskUpdate(updateData);
      expect(error).toBeUndefined();
      expect(value.title).toBe("Updated Title");
      expect(value.priority).toBe("Medium");
    });

    it("should allow empty description", () => {
      const updateData = {
        description: "",
      };

      const { error, value } = validateTaskUpdate(updateData);
      expect(error).toBeUndefined();
      expect(value.description).toBe("");
    });

    it("should reject update with no fields", () => {
      const updateData = {};

      const { error } = validateTaskUpdate(updateData);
      expect(error).toBeDefined();
    });

    it("should reject update with invalid storyPoints", () => {
      const updateData = {
        storyPoints: 200,
      };

      const { error } = validateTaskUpdate(updateData);
      expect(error).toBeDefined();
    });
  });

  describe("validatePagination", () => {
    it("should validate pagination with defaults", () => {
      const paginationData = {};

      const { error, value } = validatePagination(paginationData);
      expect(error).toBeUndefined();
      expect(value.page).toBe(1);
      expect(value.limit).toBe(10);
    });

    it("should validate pagination with custom values", () => {
      const paginationData = {
        page: 2,
        limit: 20,
      };

      const { error, value } = validatePagination(paginationData);
      expect(error).toBeUndefined();
      expect(value.page).toBe(2);
      expect(value.limit).toBe(20);
    });

    it("should reject page less than 1", () => {
      const paginationData = {
        page: 0,
      };

      const { error } = validatePagination(paginationData);
      expect(error).toBeDefined();
    });

    it("should reject limit greater than 100", () => {
      const paginationData = {
        limit: 150,
      };

      const { error } = validatePagination(paginationData);
      expect(error).toBeDefined();
    });

    it("should allow filter fields in pagination", () => {
      const paginationData = {
        page: 1,
        limit: 10,
        category: "Coding Patterns",
        priority: "High",
        status: "To Do",
        search: "test",
      };

      const { error, value } = validatePagination(paginationData);
      expect(error).toBeUndefined();
      expect(value.category).toBe("Coding Patterns");
      expect(value.search).toBe("test");
    });

    it("should allow null and empty string for filter fields", () => {
      const paginationData = {
        category: null,
        priority: "",
      };

      const { error, value } = validatePagination(paginationData);
      expect(error).toBeUndefined();
      expect(value.category).toBeNull();
      expect(value.priority).toBe("");
    });
  });
});
