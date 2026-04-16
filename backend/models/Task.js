const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      index: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      index: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        "Coding Patterns",
        "JavaScript Advanced",
        "NodeJS and ExpressJS",
        "Problem Solving and Coding",
        "React Deep Dive",
        "Redux",
        "TypeScript",
        "Web Development",
        "System Design",
      ),
      allowNull: false,
      defaultValue: "Coding Patterns",
      index: true,
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      allowNull: false,
      defaultValue: "Medium",
      index: true,
    },
    status: {
      type: DataTypes.ENUM("To Do", "In Progress", "Done"),
      allowNull: false,
      defaultValue: "To Do",
      index: true,
    },
    storyPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 100,
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      index: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["status", "created_at"],
      },
      {
        fields: ["category", "priority"],
      },
    ],
  },
);

module.exports = Task;
