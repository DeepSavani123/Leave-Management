const { leaveRequestAchieved } = require('../controllers/achievedRequest');


const router = require('express').Router();

router.get("/achievedLeave",leaveRequestAchieved)

module.exports = router;