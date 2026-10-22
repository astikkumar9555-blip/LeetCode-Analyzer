export const API_URL = "http://localhost:5000";

// true  = fake OTP, no backend needed (OTP is always 123456)
// false = real backend (server.js below) that emails the OTP through Gmail
export const DEMO_MODE = true;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

// ask the server to email an OTP
export async function sendOtp(email) {
  if (DEMO_MODE) return wait(900);

  const res = await fetch(`${API_URL}/api/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Could not send OTP");
}

//  verify the OTP and save the new password
export async function resetPassword({ email, otp, password }) {
  if (DEMO_MODE) {
    await wait(900);
    if (otp !== "123456") throw new Error("Invalid OTP (demo code is 123456)");
    return;
  }

  const res = await fetch(`${API_URL}/api/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Could not reset password");
}