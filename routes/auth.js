const router = require("express").Router();
const {
  registerStudent,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  emailVerify,
  resetPassword,
  otpVerify,
} = require("../controllers/auth");
const multer = require("multer");
const path = require("path");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// --- Multer Storage Config ---
const studentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/studentImages");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/profileImages");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const studentUpload = multer({ storage: studentStorage });
const profileUpload = multer({ storage: profileStorage });

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    if (token) {
      const redirectUrl = `${process.env.REACT_URL}/oauth-success?token=${token}&role=${user.role.name}`;
      res.redirect(redirectUrl);
    } else {
      res.redirect(`${process.env.REACT_URL}/login`);
    }
  }
);

router.post(
  "/studentRegister",
  studentUpload.single("image"),
  registerStudent
);

router.post("/login", login);
router.get("/logout", logout);
router.get("/getProfile", getProfile);
router.put("/changePassword", changePassword);
router.post("/emailVerify", emailVerify);
router.post("/otpVerify", otpVerify);
router.put("/resetPassword", resetPassword);

router.put("/updateprofile", profileUpload.single("image"), updateProfile);

module.exports = router;
