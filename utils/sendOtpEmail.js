const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN
  }
});

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Ultimate Prep" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Your Secure OTP for Ultimate Prep',
    html: `<div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: #2563eb;">Security Verification</h2>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p style="color: #6b7280; font-size: 0.9rem;">
        This code will expire in 10 minutes. Do not share it with anyone.
      </p>
    </div>`
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
};

module.exports = sendOtpEmail;