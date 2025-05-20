const router = require('express').Router();
const { getLeave } = require('../controllers/leave');

router.get('/get', getLeave);

module.exports = router;