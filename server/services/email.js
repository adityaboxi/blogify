const { Resend } = require("resend");
const nodemailer = require("nodemailer");

async function sendOTPEmail(toEmail, otp) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:2rem;background:#f9f9f9;border-radius:8px;">
      <h2 style="color:#111;">Blogify Password Reset</h2>
      <p style="color:#444;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
      <div style="font-size:2rem;font-weight:bold;letter-spacing:0.5rem;background:#fff;border:1px solid #ddd;padding:1rem;border-radius:6px;text-align:center;color:#111;">
        ${otp}
      </div>
      <p style="color:#999;margin-top:1rem;font-size:0.85rem;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Blogify <onboarding@resend.dev>",
      to: toEmail,
      subject: "Your Blogify Password Reset OTP",
      html,
    });
  } else {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Blogify" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: "Your Blogify Password Reset OTP",
      html,
    });
  }
}

module.exports = { sendOTPEmail };