const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Role = require("../models/role");
const Leave = require("../models/leave");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { default: mongoose } = require("mongoose");
const messages = require("../constants/messages.js");  

const { auth, error } = messages;

const { EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const registerStudent = async (req, res) => {
  try {
    const { name, email, password, gender, phone, address, image } = req.body;

    const isUserExist = await User.findOne({ email: email });
    const getStudentRole = await Role.findOne({ name: "Student" });

    if (isUserExist) {
      return res.status(400).json({ success: false, message: auth.emailExists });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: getStudentRole._id,
      image,
      gender,
      phone,
      address,
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    await Leave.create({
      user_id: user._id,
      total_leave: 30,
      available_leave: 30,
      used_leave: 0,
    });

    return res.status(201).json({ success: true, message: auth.registerSuccess });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || error.defaultError });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const loginUser = await User.findOne({ email: email }).populate("role");

    if (!loginUser)
      return res.status(400).json({ success: false, message: auth.invalidCredentials });

    const isMatch = await bcrypt.compare(password, loginUser.password);

    if (!isMatch)
      return res.status(400).json({ success: false, message: auth.invalidCredentials });

    const token = jwt.sign(
      {
        id: loginUser._id,
        role: loginUser.role.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res
      .status(200)
      .cookie("accessToken", token, {
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
      })
      .json({
        success: true,
        data: loginUser,
        token: token,
        message: auth.loginSuccess,
      });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || error.defaultError });
  }
};

const logout = (req, res) => {
  res.clearCookie("accessToken");
  return res.status(200).json({ success: true, message: auth.logoutSuccess });
};

const getProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const profile = await User.findOne({ _id: id });

    if (!profile) {
      return res.status(400).json({ success: false, message: auth.profileNotFound });
    }

    return res.status(200).json({
      success: true,
      data: profile,
      message: auth.profileFetchSuccess,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || error.defaultError });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      gender,
      phone,
      address,
      userId,
    } = req.body;

    const payload = {
      name,
      email,
      gender,
      image: req.file.filename,
      phone,
      address,
    };

    const isUserExists = await User.findOne({ _id: userId });

    if (!isUserExists) {
      return res.status(400).json({ success: false, message: user.notExist });
    }

    await User.findByIdAndUpdate({ _id: isUserExists._id }, { $set: payload });

    return res.status(200).json({ success: true, message: auth.profileUpdateSuccess });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || error.defaultError });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(400).json({ success: false, message: auth.userNotFound });
    }

    const comparePassword = await bcrypt.compare(oldPassword, user.password);

    if (!comparePassword) {
      return res.status(400).json({ success: false, message: auth.passwordIncorrect });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    return res.status(200).json({ success: true, message: auth.passwordUpdateSuccess });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || error.serverError });
  }
};

const emailVerify = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: auth.userNotFound });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpireAt = Date.now() + 5 * 60 * 1000;
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordTokenExpireAt = Date.now() + 1 * 60 * 60 * 1000;

    const link = `http://localhost:5173/otppage/${resetPasswordToken}/${user._id}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: user.email,
      subject: "Your OTP",
      html: `<div>
                     <h1>Your Otp : ${otp}</h1>
                     <a href = ${link}>Verify Email</a>
                    </div>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      }
    });

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          otp,
          otpExpireAt,
          resetPasswordToken,
          resetPasswordTokenExpireAt,
        },
      }
    );
    return res.status(200).json({
      success: true,
      data: { id: user._id, passwordToken: resetPasswordToken },
      message: auth.emailSent,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.serverError });
  }
};

const otpVerify = async (req, res) => {
  try {
    const { token, otp, id } = req.body;
    const userId = new mongoose.Types.ObjectId(id);
    const numOtp = parseInt(otp);

    const user = await User.findOne({
      _id: userId,
      resetPasswordToken: token,
      otp: numOtp,
      otpExpireAt: { $gt: Date.now() },
      resetPasswordTokenExpireAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: auth.otpExpired });
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          otp: null,
          resetPasswordToken: "",
          otpExpireAt: null,
          resetPasswordTokenExpireAt: null,
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: { id: user._id },
      message: auth.otpVerified,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.serverError });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, id } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: auth.userNotFound });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    return res.status(200).json({ success: true, message: auth.passwordResetSuccess });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.serverError });
  }
};

module.exports = {
  registerStudent,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  emailVerify,
  otpVerify,
  resetPassword,
};
