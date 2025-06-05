const nodemailer = require("nodemailer");

const { EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendMail = async ({ to, subject, text }) => {
  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send email:", err.message);
  }
};

module.exports = sendMail;
