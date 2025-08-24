const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes and optionally restrict by roles.
 * @param {Array} roles - optional array of allowed roles, e.g., ['admin', 'user']
 */
const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      // 1️⃣ Extract token from Authorization header
      const authHeader = req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }
      const token = authHeader.split(' ')[1].trim();

      // 2️⃣ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3️⃣ Attach user info to request
      req.user = { id: decoded.id, role: decoded.role };

      // 4️⃣ Role-based access control (if roles are specified)
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }

      next(); // ✅ token valid and roles allowed
    } catch (err) {
      console.error('Auth middleware error:', err.message);
      return res.status(401).json({ message: 'Unauthorized: Token is invalid or expired' });
    }
  };
};

module.exports = auth;
