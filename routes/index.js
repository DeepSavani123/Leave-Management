const router = require('express').Router();
const role = require('./role.js');
const auth = require('./auth');
const student = require('./student.js');
const hodAndStaff = require('./hod&staff');
const leaveRequest = require('./leaveRequest.js')

const authorization = require('../middlewares/authorization');



router.use(authorization);
router.use('/auth', auth);
router.use('/role',  role);
router.use('/student', student);
router.use('/hodAndStaff', hodAndStaff);
router.use('/leaveRequest', leaveRequest);


module.exports = router;