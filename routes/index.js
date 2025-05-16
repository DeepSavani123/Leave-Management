const router = require('express').Router();
const role = require('./role.js');
const auth = require('./auth');
const student = require('./student.js');
const authorization = require('../middlewares/authorization');


router.use(authorization);
router.use('/auth', auth);
router.use('/role',  role);
router.use('/student', student);


module.exports = router;