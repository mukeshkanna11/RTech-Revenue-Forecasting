// src/middlewares/validate.js

const validate = (schema = {}) => {

  return (req, res, next) => {

    try {

      const errors = [];

      /* =====================================
         SUPPORT SIMPLE SCHEMA (BACKWARD SAFE)
         e.g. validate(invoiceSchema)
      ===================================== */
      if (typeof schema.validate === "function") {

        const { error, value } = schema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.details.map(e => ({
              field: e.path.join("."),
              message: e.message
            }))
          });
        }

        req.body = value; // sanitized
        return next();
      }

      /* =====================================
         ADVANCED SCHEMA (body, params, query)
      ===================================== */

      if (schema.body) {
        const { error, value } = schema.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) errors.push(...error.details);
        else req.body = value;
      }

      if (schema.params) {
        const { error, value } = schema.params.validate(req.params, {
          abortEarly: false
        });

        if (error) errors.push(...error.details);
        else req.params = value;
      }

      if (schema.query) {
        const { error, value } = schema.query.validate(req.query, {
          abortEarly: false
        });

        if (error) errors.push(...error.details);
        else req.query = value;
      }

      /* =====================================
         ERROR RESPONSE
      ===================================== */

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map(e => ({
            field: e.path.join("."),
            message: e.message
          }))
        });
      }

      next();

    } catch (err) {

      console.error("❌ Validation middleware error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal validation error"
      });

    }

  };

};

module.exports = validate;