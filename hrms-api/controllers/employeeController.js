const Employee = require('../models/Employee');
const User = require('../models/User');

// Create a new employee profile
exports.createEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all employees (Admin/Manager only)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("userId departmentId");
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("userId departmentId");
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // If user is employee and not accessing own data
    if (req.user.role === "employee" && !employee.userId.equals(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update employee by ID
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Allow only self-update for employees
    if (req.user.role === "employee" && !employee.userId.equals(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    Object.assign(employee, req.body);
    await employee.save();
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete (soft deactivate) employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    await User.findByIdAndUpdate(employee.userId, { isActive: false });
    res.json({ message: "Employee deactivated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
