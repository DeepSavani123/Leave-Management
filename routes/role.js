const router = require('express').Router();

const { createRole } = require('../controllers/role');

router.post('/create', createRole);


module.exports = router;