/**
 * Wraps an async route handler or controller to catch any unhandled promise rejections
 * and forward them to the Express error-handling middleware.
 *
 * @param {Function} fn - Async Express route handler (req, res, next)
 * @returns {Function} Express middleware handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
