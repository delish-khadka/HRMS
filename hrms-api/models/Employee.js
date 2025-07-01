const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    contactNumber: { type: String },
    address: { type: String },
    hireDate: { type: Date, default: Date.now },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    position: { type: String },
    salary: { type: Number },
    employmentType: { type: String, enum: ["full-time", "part-time", "contract"] },
    leaveBalance: {
      annual: { type: Number, default: 12 },
      sick: { type: Number, default: 8 },
    },
    photo: {
      type: String, // store image path
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
