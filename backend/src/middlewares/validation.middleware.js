/**
 * Middleware to validate that required keys exist on the request body.
 *
 * @param {string[]} requiredFields - List of required property names
 * @returns {Function} Express middleware
 */
export function validateRequiredBody(requiredFields) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Request body must be a valid JSON object'
        }
      });
    }

    const missing = requiredFields.filter(f => req.body[f] === undefined || req.body[f] === null || req.body[f] === '');
    if (missing.length > 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: `Missing required field(s): ${missing.join(', ')}`,
          missingFields: missing
        }
      });
    }

    next();
  };
}

/**
 * Middleware to sanitize and validate route parameters.
 *
 * @param {string} paramName - Route parameter key (e.g. 'id')
 * @returns {Function} Express middleware
 */
export function validateParamExists(paramName) {
  return (req, res, next) => {
    const val = req.params[paramName];
    if (!val || typeof val !== 'string' || val.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PARAMETER',
          message: `Route parameter '${paramName}' is required and cannot be empty.`
        }
      });
    }
    next();
  };
}
