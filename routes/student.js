const router = require('express').Router();
const { adminAddStudent, getByIdStudent} = require('../controllers/student');
const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb('null', './public/studentImages')
    },

    filename: function(req, file, cb) {
        cb('null', `${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage})

router.post('/admin-add-student', upload.single('image'), adminAddStudent);
router.get('/get-by-id-student/:id', getByIdStudent);


module.exports = router;