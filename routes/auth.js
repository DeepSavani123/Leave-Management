const router = require('express').Router();
const { registerStudent, login, logout, getProfile, updateProfile } = require('../controllers/auth');
const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
     destination: function(res,file,cb) {
         cb(null, './public/studentImages')
     },

     filename: function(req,file,cb){
         cb(null, `${Date.now()}${path.extname(file.originalname)}`)
     }
})

const upload = multer({ storage: storage })
router.post('/student-register',upload.single('image'), registerStudent);
router.post('/login', login);
router.get('/logout', logout);
router.get('/getprofile',getProfile)
router.put('/updateprofile', updateProfile)

module.exports = router;