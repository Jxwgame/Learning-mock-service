const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendOtpEmail({ to, otp }) {
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject: "Your MFA code",
    text: `Your verification code is: ${otp} (expires in ${Math.floor((process.env.MFA_OTP_TTL_SEC) / 60)} minutes)`,
  });
}

module.exports = { sendOtpEmail };
