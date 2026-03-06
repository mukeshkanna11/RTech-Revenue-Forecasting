const Joi = require("joi");

exports.revenueSchema = Joi.object({
  month: Joi.number().min(1).max(12).required(),
  year: Joi.number().required(),
  department: Joi.string().required(),
  amount: Joi.number().positive().required()
});