const router = require("express").Router();
const {
  adminAddStudent,
  adminEditStudent,
  getByIdStudent,
  getAllStudents,
  adminDeleteStudent,
} = require("../controllers/studentController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb("null", "./public/studentImages");
  },

  filename: function (req, file, cb) {
    cb("null", `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post("/addStudent", upload.single("image"), adminAddStudent);
router.get("/students", getAllStudents);
router.get("/getByIdStudent/:id", getByIdStudent);
router.put("/editStudent", adminEditStudent);
router.delete("/deleteStudent/:id", adminDeleteStudent);

module.exports = router;
