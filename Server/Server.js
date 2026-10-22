require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); // your Vite URL
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

const otpStore = new Map(); // email -> { hash, expires, attempts }
const hash = (v) => crypto.createHash("sha256").update(v).digest("hex");

app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = String(crypto.randomInt(100000, 1000000));
  otpStore.set(email, { hash: hash(otp), expires: Date.now() + 5 * 60 * 1000, attempts: 0 });

  try {
    await transporter.sendMail({
      from: `"Leetcode Analyzer" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your password reset code",
      html: `<div style="font-family:Arial;padding:20px">
               <h2>Password reset</h2>
               <p>Your verification code is:</p>
               <h1 style="letter-spacing:8px;color:#0a66c2">${otp}</h1>
               <p>It expires in 5 minutes. If you didn't request this, ignore this email.</p>
             </div>`,
    });
    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not send email" });
  }
});

app.post("/api/reset-password", (req, res) => {
  const { email, otp, password } = req.body;
  const rec = otpStore.get(email);

  if (!rec || Date.now() > rec.expires) return res.status(400).json({ message: "OTP expired, request a new one" });
  if (rec.attempts >= 5) return res.status(429).json({ message: "Too many attempts" });

  rec.attempts++;
  if (rec.hash !== hash(String(otp))) return res.status(400).json({ message: "Invalid OTP" });

  otpStore.delete(email);
  // TODO: hash `password` with bcrypt and update the user in your database here
  res.json({ message: "Password updated" });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));