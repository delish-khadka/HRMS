const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const dashboardController = require("../controllers/dashboardController");

router.get("/overview", auth(["admin", "manager"]), dashboardController.getDashboardStats);

module.exports = router;
