const jwt = require("jsonwebtoken");

const allowedUrls = [
  "/auth/studentRegister",
  "/auth/login",
  "/auth/google",
  "/auth/google/callback",
  "/role/create",
  "/auth/emailVerify",
  "/auth/otpVerify",
  "/auth/resetPassword",
  "/auth/logout",
];

const authorization = (req, res, next) => {
  if (allowedUrls.includes(req.path)) {
    return next();
  }

  const token =
    req?.cookies?.accessToken ||
    req.get("Authorization") ||
    req.headers["authorization"];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Authorization header missing!" });

  if (token.startsWith("Bearer ")) {
    token = token?.split(" ")[1];
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = authorization;
