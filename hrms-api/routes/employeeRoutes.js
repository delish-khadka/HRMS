const express = require("express");
const router = express.Router();
const { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee, getMyProfile } = require("../controllers/employeeController");
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");
const Employee = require("../models/Employee"); // ✅ Add this

// Routes secured by authentication
router.post("/", auth(["admin"]), createEmployee);
router.get("/", auth(["admin", "manager"]), getAllEmployees);
router.get("/me", auth(["employee"]), getMyProfile);
router.get("/:id", auth(["admin", "manager", "employee"]), getEmployeeById);
router.put("/:id", auth(["admin", "manager", "employee"]), updateEmployee);
router.delete("/:id", auth(["admin"]), deleteEmployee);

const fs = require('fs'); // Node.js file system module

router.post('/:id/upload-photo', auth(['admin', 'manager']), upload.single('photo'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      // Delete uploaded file if employee doesn't exist
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.photo = req.file.path;
    await employee.save();

    res.json({ message: 'Photo uploaded successfully', path: req.file.path });
  } catch (err) {
    // Clean up uploaded file on server error
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
