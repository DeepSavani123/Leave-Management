const router = require("express").Router();
const {
  adminAddStudent,
  getByIdStudent,
  getAllStudents,
  adminEditStudent,
  adminDeleteStudent,
} = require("../controllers/student");
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

router.post("/add-student", upload.single("image"), adminAddStudent);
router.get("/students", getAllStudents);
router.get("/get-by-id-student/:id", getByIdStudent);
router.put("/admin-edit-student", adminEditStudent);
router.delete("/admin-delete-student/:id", adminDeleteStudent);

module.exports = router;
