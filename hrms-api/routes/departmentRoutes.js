const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const auth = require('../middleware/auth.middleware');

// Routes
router.post('/', auth(['admin']), departmentController.createDepartment);
router.get('/', auth(['admin', 'manager']), departmentController.getAllDepartments);
router.get('/:id', auth(['admin', 'manager']), departmentController.getDepartmentById);
router.put('/:id', auth(['admin']), departmentController.updateDepartment);

module.exports = router;
