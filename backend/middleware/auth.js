const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
  return (req, res, next) => {
    try {
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

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = { id: decoded.id, role: decoded.role };

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
      }

      next(); 
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
