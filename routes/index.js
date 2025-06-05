const router = require("express").Router();
const role = require("./role");
const auth = require("./auth");
const leave = require("./leave");
const student = require("./student");
const hodAndStaff = require("./hod.js");
const leaveRequest = require("./leaveRequest");
const achievedRequest = require("./achievedRequest");
const authorization = require("../middlewares/authorization");
const report = require("./leaveReport.js");

router.use(authorization);
router.use("/auth", auth);
router.use("/role", role);
router.use("/student", student);
router.use("/hodAndStaff", hodAndStaff);
router.use("/leaveRequest", leaveRequest);
router.use("/achievedRequest", achievedRequest);
router.use("/leave", leave);
router.use("/report", report);

module.exports = router;
