const router = require('express').Router()

const { applyLeave, getIndividualLeave } = require("../controllers/leaveRequest");

router.post('/applyLeave',applyLeave);
router.get("/getindividualleave", getIndividualLeave);


module.exports = router;