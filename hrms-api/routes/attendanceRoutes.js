// routes/attendance.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth.middleware');

// ✅ Employee routes
router.post('/check-in', auth(['employee']), attendanceController.checkIn);
router.post('/check-out', auth(['employee']), attendanceController.checkOut);
router.get('/my-history', auth(['employee']), attendanceController.myHistory);

// ✅ Admin/Manager routes
router.get('/', auth(['admin', 'manager']), attendanceController.getAll);
router.get('/employee/:employeeId', auth(['admin', 'manager']), attendanceController.getByEmployee);

module.exports = router;
