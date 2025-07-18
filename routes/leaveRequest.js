const router = require('express').Router();

const { applyLeave, approveLeave, getIndividualLeave, getAllLeaves, requestToOptions, updateLeave, deleteLeave, getoneLeave } = require('../controllers/leaveRequest');

router.post('/applyLeave',applyLeave);
router.post('/approveLeave',approveLeave);
router.get("/getindividualleave", getIndividualLeave);
router.get('/getoneLeave/:id', getoneLeave)
router.put('/updateLeave/:editId', updateLeave)
router.delete('/deleteLeave/:id', deleteLeave)
router.get('/request_to', requestToOptions)
router.get("/getAllLeave", getAllLeaves)



module.exports = router;