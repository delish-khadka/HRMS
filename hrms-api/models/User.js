const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
  isActive: { type: Boolean, default: true },
  isTempPassword: { type: Boolean, default: false },
  tempPasswordExpiry: Date,
  requiresPasswordReset: { type: Boolean, default: false },
  lastLogin: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
