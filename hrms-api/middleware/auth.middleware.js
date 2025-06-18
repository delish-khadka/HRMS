const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

// module.exports = function (allowedRoles = []) {
//   return async function (req, res, next) {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.userId);
//       if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid token or user inactive.' });

//       if (allowedRoles.length && !allowedRoles.includes(user.role)) {
//         return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
//       }

//       req.user = user;
//       next();
//     } catch (err) {
//       res.status(401).json({ message: 'Invalid or expired token.' });
//     }
//   };
// };

module.exports = function (allowedRoles = [], options = {}) {
  const { allowInactive = false } = options;

  return async function (req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) return res.status(401).json({ message: 'Invalid token. User not found.' });

      if (!user.isActive && !allowInactive) {
        return res.status(401).json({ message: 'Account is inactive.' });
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions.' });
      }

      req.user = user;

      //for leave request in employee
      if (user.role === 'employee') {
        const employee = await Employee.findOne({ userId: user._id });
        if (employee) req.user.employeeId = employee._id;  // ✅ Attach Employee ID
      }

      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };
};