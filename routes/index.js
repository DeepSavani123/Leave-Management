const router = require('express').Router();
const role = require('./role.js');
const auth = require('./auth');
const student = require('./student.js');
const hodAndStaff = require('./hod&staff');

const authorization = require('../middlewares/authorization');


router.use(authorization);
router.use('/auth', auth);
router.use('/role',  role);
router.use('/student', student);
router.use('/hodAndStaff', hodAndStaff);


module.exports = router;