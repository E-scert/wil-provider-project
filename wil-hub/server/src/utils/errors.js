function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Maps common Postgres constraint errors to clean, user-facing messages. */
function formatPgError(err) {
  const known = {
    23505: 'That value already exists — please use a different one.',
    23503: 'This record is referenced elsewhere and cannot be used like this.',
    23502: 'A required field is missing.',
    23514: "That value violates a rule (e.g. a status must be one of the allowed options).",
  };
  if (err.code && known[err.code]) return known[err.code];
  return err.message || 'Unexpected database error.';
}

module.exports = { asyncHandler, AppError, formatPgError };
