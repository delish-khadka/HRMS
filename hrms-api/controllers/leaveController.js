const LeaveRequest = require("../models/leaveRequest");

// Create leave request
exports.createLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }

    const leave = new LeaveRequest({
      employee: req.user.employeeId,
      startDate,
      endDate,
      reason
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
    const leaves = await LeaveRequest.find()
      .populate('employee', 'firstName lastName')
      .populate('reviewedBy', 'name');
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve/reject leave
exports.updateLeaveStatus = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    await leave.save();

    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
