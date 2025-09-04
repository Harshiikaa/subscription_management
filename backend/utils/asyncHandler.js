/**
 * Creates a middleware that wraps a controller function and catches any errors it throws or rejects with a promise.
 * @param {function} fn - The controller function to be wrapped.
 * @returns {function} - A middleware function that wraps the controller function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
