const router = require("express").Router();
const {
  adminAddHODAndStaff,
  adminEditHODAndStaff,
  getByIdHODAndStaff,
  getAllHODAndStaff,
  adminDeleteHODAndStaff,
} = require("../controllers/hodController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/hod_Staff_images");
  },

  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post("/addHodStaff", upload.single("image"), adminAddHODAndStaff);
router.put("/editHodStaff", adminEditHODAndStaff);
router.get("/getByIdHodStaff/:id", getByIdHODAndStaff);
router.get("/hodStaffs", getAllHODAndStaff);
router.delete("/deleteHodStaff/:id", adminDeleteHODAndStaff);

module.exports = router;
