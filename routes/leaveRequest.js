const router = require('express').Router()

const { applyLeave, getIndividualLeave, approveLeave, requestToOptions, getAllLeaves } = require("../controllers/leaveRequest");

router.post('/applyLeave',applyLeave);
router.post('/approveLeave',approveLeave);
router.get("/getindividualleave", getIndividualLeave)   ;
router.get('/request_to', requestToOptions)
router.get("/getAllLeave", getAllLeaves)


module.exports = router;