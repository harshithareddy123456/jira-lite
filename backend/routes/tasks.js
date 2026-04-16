const express = require("express");
const taskController = require("../controllers/taskController");

const router = express.Router();

// Task routes
router.get("/", taskController.getAllTasks);
router.get("/stats", taskController.getTaskStats);
router.get("/:id", taskController.getTaskById);
router.post("/", taskController.createTask);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
