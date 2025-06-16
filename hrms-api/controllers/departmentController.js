const Department = require('../models/Department');

exports.createDepartment = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Department already exists.' });
    }

    const department = new Department({ name, description, managerId });
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('managerId', 'firstName lastName');
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('managerId');
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, managerId },
      { new: true }
    );
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
