const express = require("express");
const router = express.Router();
const { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee, getMyProfile } = require("../controllers/employeeController");
const auth = require("../middleware/auth.middleware");

// Routes secured by authentication
router.post("/", auth(["admin"]), createEmployee);
router.get("/", auth(["admin", "manager"]), getAllEmployees);
router.get("/me", auth(["employee"]), getMyProfile);
router.get("/:id", auth(["admin", "manager", "employee"]), getEmployeeById);
router.put("/:id", auth(["admin", "manager", "employee"]), updateEmployee);
router.delete("/:id", auth(["admin"]), deleteEmployee);

module.exports = router;
