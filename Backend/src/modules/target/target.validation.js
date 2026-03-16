const Joi = require("joi");

const createTargetSchema = {
  body: Joi.object({
    month: Joi.number().min(1).max(12).required(),
    year: Joi.number().required(),
    department: Joi.string()
      .valid("sales", "marketing", "engineering", "finance", "hr", "operations")
      .required(),
    targetAmount: Joi.number().min(0).required()
  })
};

const updateTargetSchema = {
  body: Joi.object({
    month: Joi.number().min(1).max(12),
    year: Joi.number(),
    department: Joi.string().valid(
      "sales",
      "marketing",
      "finance",
      "hr",
      "operations"
    ),
    targetAmount: Joi.number().min(0)
  })
};

module.exports = {
  createTargetSchema,
  updateTargetSchema
};