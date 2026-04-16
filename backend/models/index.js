const sequelize = require("../config/sequelize");
const Task = require("./Task");

const models = {
  Task,
};

// Sync all models
Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = require("sequelize");

module.exports = models;
