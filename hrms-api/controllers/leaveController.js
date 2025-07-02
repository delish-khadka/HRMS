const LeaveRequest = require("../models/leaveRequest");
const Employee = require("../models/Employee");

// Create leave request
exports.createLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }

    const leave = new LeaveRequest({
      employee: req.user.employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get own leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.user.employeeId }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all leaves (admin/manager)
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().populate("employee", "firstName lastName").populate("reviewedBy", "name");
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    console.log(leave);

    // Deduct leave balance only if approving
    if (status === "approved" && leave.status !== "approved") {
      const daysRequested = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24) + 1);

      const employee = await Employee.findById(leave.employee);

      if (!employee) return res.status(404).json({ message: "Employee not found" });

      const type = leave.leaveType;
      const currentBalance = employee.leaveBalance[type];

      if (currentBalance < daysRequested) {
        return res.status(400).json({ message: `Insufficient ${type} leave balance` });
      }

      // console.log(type);
      // console.log(leaveBalance[type]);
      employee.leaveBalance[type] -= daysRequested;

      // console.log(daysRequested);
      await employee.save();
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    await leave.save();

    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
