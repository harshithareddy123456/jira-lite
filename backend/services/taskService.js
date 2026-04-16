const { Task } = require("../models");
const { Op } = require("sequelize");

class TaskService {
  async getAllTasks(filters, pagination) {
    const { category, priority, status, search } = filters;
    const { page, limit } = pagination;

    const where = {};

    if (category && category !== "All") {
      where.category = category;
    }
    if (priority && priority !== "All") {
      where.priority = priority;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Task.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      tasks: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  async getTaskById(id) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  }

  async createTask(taskData) {
    const task = await Task.create({
      taskId: taskData.taskId,
      title: taskData.title,
      description: taskData.description || "",
      category: taskData.category,
      priority: taskData.priority,
      status: taskData.status,
      storyPoints: parseInt(taskData.storyPoints) || 1,
    });
    return task;
  }

  async updateTask(id, updateData) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error("Task not found");
    }

    const updatableFields = [
      "title",
      "description",
      "category",
      "priority",
      "status",
      "storyPoints",
    ];

    for (const field of updatableFields) {
      if (updateData[field] !== undefined) {
        if (field === "storyPoints") {
          task[field] = parseInt(updateData[field]);
        } else {
          task[field] = updateData[field];
        }
      }
    }

    await task.save();
    return task;
  }

  async deleteTask(id) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error("Task not found");
    }

    await task.destroy();
    return task;
  }

  async getTaskStats() {
    const stats = await Task.findAll({
      attributes: [
        "status",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "count",
        ],
        [
          require("sequelize").fn(
            "SUM",
            require("sequelize").col("storyPoints"),
          ),
          "totalStoryPoints",
        ],
      ],
      group: ["status"],
      raw: true,
    });

    const totalStats = await Task.findAll({
      attributes: [
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "total",
        ],
        [
          require("sequelize").fn(
            "SUM",
            require("sequelize").col("storyPoints"),
          ),
          "totalStoryPoints",
        ],
      ],
      raw: true,
    });

    return {
      byStatus: stats,
      total: totalStats[0],
    };
  }
}

module.exports = new TaskService();
