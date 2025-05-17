const router = require('express').Router();
const { adminAddHODAndStaff, adminEditHODAndStaff, getByIdHODAndStaff, getAllHODAndStaff, adminDeleteHODAndStaff } = require('../controllers/hod&staff');
const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./public/hod_Staff_images')
    },
    
    filename: function(req,file,cb){
        cb(null, `${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage})

router.post('/admin-add-hodstaff', upload.single('image'), adminAddHODAndStaff);
router.put('/admin-edit-hodstaff', adminEditHODAndStaff);
router.get('/get-by-id-hodstaff/:id', getByIdHODAndStaff);
router.get('/hodstaffs', getAllHODAndStaff);
router.delete('/admin-delete-hodstaff', adminDeleteHODAndStaff)

module.exports = router;