const jwt = require('jsonwebtoken');

/**
 * Auth middleware to protect routes and optionally restrict by roles.
 * @param {Array} roles - optional array of allowed roles, e.g., ['admin', 'member']
 */
const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      // 1️⃣ Get token (from Authorization header or cookie)
      let token;
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1].trim();
      } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }

      if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Token missing' });
      }

      // 2️⃣ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3️⃣ Attach user info to request
      req.user = { id: decoded.id, role: decoded.role };

      // 4️⃣ Check role if needed
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
      }

      next(); // ✅ all good
    } catch (err) {
      console.error('Auth middleware error:', err.message);

      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Unauthorized: Token expired' });
      }

      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
  };
};

module.exports = auth;
