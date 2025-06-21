const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/leaveRequest');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalEmployees = await Employee.countDocuments();

    const presentToday = await Attendance.countDocuments({ date: today });
    
    const leaveToday = await LeaveRequest.countDocuments({
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: 'approved'
    });

    const absent = totalEmployees - (presentToday + leaveToday);

    res.json({
      totalEmployees,
      presentToday,
      leaveToday,
      absent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
