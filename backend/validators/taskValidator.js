const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required(),
  description: Joi.string().trim().max(5000).allow(""),
  category: Joi.string()
    .valid(
      "Coding Patterns",
      "JavaScript Advanced",
      "NodeJS and ExpressJS",
      "Problem Solving and Coding",
      "React Deep Dive",
      "Redux",
      "TypeScript",
      "Web Development",
      "System Design",
    )
    .required(),
  priority: Joi.string().valid("Low", "Medium", "High").required(),
  status: Joi.string().valid("To Do", "In Progress", "Done").required(),
  storyPoints: Joi.number().integer().min(1).max(100).required(),
  taskId: Joi.string().required(),
});

const taskUpdateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255),
  description: Joi.string().trim().max(5000).allow(""),
  category: Joi.string().valid(
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
  priority: Joi.string().valid("Low", "Medium", "High"),
  status: Joi.string().valid("To Do", "In Progress", "Done"),
  storyPoints: Joi.number().integer().min(1).max(100),
}).min(1);

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().allow("", null),
  priority: Joi.string().allow("", null),
  status: Joi.string().allow("", null),
  search: Joi.string().trim().allow("", null),
});

const validateTask = (data) => {
  const { error, value } = taskSchema.validate(data);
  return { error, value };
};

const validateTaskUpdate = (data) => {
  const { error, value } = taskUpdateSchema.validate(data);
  return { error, value };
};

const validatePagination = (data) => {
  const { error, value } = paginationSchema.validate(data);
  return { error, value };
};

module.exports = {
  validateTask,
  validateTaskUpdate,
  validatePagination,
};
