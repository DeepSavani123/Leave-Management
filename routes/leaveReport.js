const { getLeaveReport } = require("../controllers/leaveReport");

const router = require("express").Router();

router.get("/leaveReport", getLeaveReport);

module.exports = router;
