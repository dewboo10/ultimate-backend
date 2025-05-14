const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Ultimate Prep" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp} (valid for 10 minutes)`
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};