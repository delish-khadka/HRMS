const Employee = require("../models/Employee");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Create a new employee profile
exports.createEmployee = async (req, res) => {
  try {
    const { username, email, role, firstName, lastName, dateOfBirth, gender, contactNumber, address, hireDate, departmentId, position, salary, employmentType } = req.body;

    // 1. Create user with temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = new User({
      username,
      email,
      passwordHash,
      role,
      isActive: false,
      isTempPassword: true,
      tempPasswordExpiry: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
      requiresPasswordReset: true,
    });
    await user.save();

    // 2. Create employee profile
    const employee = new Employee({
      userId: user._id,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactNumber,
      address,
      hireDate,
      departmentId,
      position,
      salary,
      employmentType,
      leaveBalance: {
        annual: 12,
        sick: 8,
      },
    });
    await employee.save();

    res.status(201).json({
      message: "Employee created",
      tempPassword,
      employeeId: employee._id,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("departmentId");

    const updated = employees.map((emp) => ({
      ...emp.toObject(),
      photo: emp.photo ? `${req.protocol}://${req.get("host")}/${emp.photo}` : null,
    }));

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single employee by ID
// exports.getEmployeeById = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id).populate("userId departmentId");
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

// // If user is employee and not accessing own data
// if (req.user.role === "employee" && !employee.userId.equals(req.user._id)) {
//   return res.status(403).json({ message: "Forbidden" });
// }

//     res.json(employee);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("departmentId");
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // If user is employee and not accessing own data
    if (req.user.role === "employee" && !employee.userId.equals(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const empObj = employee.toObject();
    empObj.photo = employee.photo ? `${req.protocol}://${req.get("host")}/${employee.photo}` : null;

    res.json(empObj);
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

// Get logged-in employee's profile
exports.getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id }).populate("departmentId");
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const empObj = employee.toObject();
    empObj.photo = employee.photo ? `${req.protocol}://${req.get("host")}/${employee.photo}` : null;

    res.json(empObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.getMyProfile = async (req, res) => {
//   try {
//     const employee = await Employee.findOne({ userId: req.user._id }).populate("departmentId", "name description").populate({
//       path: "userId",
//       select: "username email role lastLogin isActive",
//     });

//     if (!employee) {
//       return res.status(404).json({ message: "Employee profile not found." });
//     }

//     res.json(employee);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
