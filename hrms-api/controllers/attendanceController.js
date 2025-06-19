// attendanceController.js
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/leaveRequest');

// Utility function to check if employee is on approved leave
const isOnLeave = async (employeeId, date) => {
  const leaves = await LeaveRequest.find({
    employee: employeeId,
    status: 'approved',
    startDate: { $lte: date },
    endDate: { $gte: date }
  });
  return leaves.length > 0;
};

// Check-in
exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const today = new Date().toISOString().slice(0, 10);

    if (await isOnLeave(employeeId, new Date(today))) {
      return res.status(400).json({ message: 'Cannot check-in while on approved leave.' });
    }

    const existing = await Attendance.findOne({ employee: employeeId, date: today });
    if (existing) return res.status(400).json({ message: 'Already checked in today.' });

    const record = new Attendance({ employee: employeeId, date: today, checkIn: new Date() });
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check-out
exports.checkOut = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const today = new Date().toISOString().slice(0, 10);

    const record = await Attendance.findOne({ employee: employeeId, date: today });
    if (!record) return res.status(404).json({ message: 'No check-in found for today.' });

    if (record.checkOut) return res.status(400).json({ message: 'Already checked out today.' });

    record.checkOut = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View my attendance history
exports.myHistory = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const history = await Attendance.find({ employee: employeeId }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: View all attendance
exports.getAll = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate('employee', 'firstName lastName')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: View attendance of specific employee
exports.getByEmployee = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.params.employeeId })
      .populate('employee', 'firstName lastName')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
