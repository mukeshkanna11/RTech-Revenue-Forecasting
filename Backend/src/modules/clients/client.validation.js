const Joi = require("joi");

exports.createClientSchema = Joi.object({
  name: Joi.string().required(),

  companyName: Joi.string().allow(""),

  email: Joi.string().email().required(),

  phone: Joi.string().allow(""),

  address: Joi.string().allow(""),

  industry: Joi.string().allow("")
});