const Joi = require("joi");

exports.targetSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).required(),
  department: Joi.string().trim().min(2).max(100).required(),
  targetAmount: Joi.number().positive().required()
});

// 🔥 Partial update schema
exports.updateTargetSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12),
  year: Joi.number().integer().min(2000),
  department: Joi.string().trim().min(2).max(100),
  targetAmount: Joi.number().positive()
}).min(1); // at least one field required