const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError(401, 'Missing or invalid Authorization header.'));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload: { user_id, email, role, linked_id }
    req.user = payload;
    next();
  } catch (err) {
    next(new AppError(401, 'Your session has expired or is invalid — please log in again.'));
  }
}

/** Use after requireAuth. Pass one or more allowed roles. */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError(401, 'Not authenticated.'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, `This action requires one of these roles: ${roles.join(', ')}.`));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
