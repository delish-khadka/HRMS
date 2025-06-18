const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const leaveController = require('../controllers/leaveController');

router.post('/', auth(['employee']), leaveController.createLeave);
router.get('/my', auth(['employee']), leaveController.getMyLeaves);
router.get('/', auth(['admin', 'manager']), leaveController.getAllLeaves);
router.put('/:id/status', auth(['admin', 'manager']), leaveController.updateLeaveStatus);

module.exports = router;
