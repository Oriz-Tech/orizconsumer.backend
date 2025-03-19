// src/validators/userValidator.js
const Joi = require('joi');

// Define the validation schema
const checkSchema = Joi.object({
  identifier: Joi.string().required(),
  identifierType: Joi.string().required()
});

module.exports = { checkSchema };