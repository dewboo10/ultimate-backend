
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async (email) => {
  try {
    await transporter.sendMail({
      from: `"Ultimate Prep" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome!',
      text: `Thanks for signing up! Your account is now active.`
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};
