// utils/sendOtpEmail.js
const nodemailer = require("nodemailer");

const sendOtpEmail = async (toEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your app password
      },
    });

    const mailOptions = {
      from: `"Ultimate Prep" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "🔐 Your OTP for Ultimate Prep",
      html: `<div style="font-family:sans-serif;">
        <h2>🧾 Your OTP is: <span style="color:#4F46E5;">${otp}</span></h2>
        <p>This OTP will expire in 10 minutes. Please do not share it with anyone.</p>
      </div>`,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error };
  }
};

module.exports = sendOtpEmail;
