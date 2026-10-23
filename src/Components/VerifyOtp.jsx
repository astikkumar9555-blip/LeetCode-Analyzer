import { useState, useEffect } from "react";
import { Icon } from "./Icons";
import OtpInput from "./OtpInput";
import PasswordField from "./PasswordField";
import SwitchRow from "./SwitchRow";
import { sendOtp, resetPassword } from "../services/authApi";

const OTP_LIFETIME = 300; // seconds, same as the 5 minutes on the server
const LABELS = ["Min 8 characters", "Weak", "Okay", "Good", "Strong"];

// 0 = empty, 1 = weak ... 4 = strong
function getStrength(pw) {
  if (!pw) return 0;
  if (pw.length < 8) return 1;
  let s = 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const formatTime = (t) =>
  `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

export default function VerifyOtp({ email, goTo, onSuccess }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [pw, setPw] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);       // resend button lock
  const [expiry, setExpiry] = useState(OTP_LIFETIME); // code lifetime

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (expiry <= 0) return;
    const t = setTimeout(() => setExpiry((e) => e - 1), 1000);
    return () => clearTimeout(t);
  }, [expiry]);

  const strength = getStrength(pw.password);
  const strengthLabel =
    pw.password && pw.password.length < 8 ? "Too short" : LABELS[strength];

  const confirmStatus = !pw.confirm ? "" : pw.confirm === pw.password ? "ok" : "bad";

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await sendOtp(email);
      setOtp(Array(6).fill(""));
      setCooldown(30);
      setExpiry(OTP_LIFETIME);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (expiry <= 0) return setError("OTP expired — please resend a new one");
    if (code.length < 6) return setError("Enter the 6-digit OTP");
    if (pw.password.length < 8) return setError("Password must be at least 8 characters");
    if (pw.password !== pw.confirm) return setError("Passwords do not match");

    setLoading(true);
    setError("");
    try {
      await resetPassword({ email, otp: code, password: pw.password });
      onSuccess({
        to: "login", // after the animation → back to the Login page
        title: "Verified successfully",
        sub: "Password updated — please login again",
        steps: ["Code verified", "Password updated", "Securing your session"],
      });
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="icon-badge"><Icon name="key" /></div>
      <h2 className="title">Verify & Reset</h2>
      <p className="subtitle">Enter the OTP sent to <b>{email}</b></p>

      <OtpInput otp={otp} setOtp={setOtp} />

      <div className="otp-meta">
        <span className={`pill ${expiry <= 0 ? "expired" : ""}`}>
          <Icon name="clock" size={13} />
          {expiry > 0 ? `Expires in ${formatTime(expiry)}` : "Code expired"}
        </span>

        <button
          type="button"
          className="link-btn"
          onClick={handleResend}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
        </button>
      </div>

      <div className="pw-group">
        <PasswordField
          placeholder="New Password"
          autoComplete="new-password"
          value={pw.password}
          onChange={(v) => setPw({ ...pw, password: v })}
        />

        <div className="strength">
          <div className="bars">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={n <= strength ? `on lvl-${strength}` : ""} />
            ))}
          </div>
          <span className={`label lvl-${strength}`}>{strengthLabel}</span>
        </div>
      </div>

      <PasswordField
        placeholder="Confirm New Password"
        autoComplete="new-password"
        status={confirmStatus}
        value={pw.confirm}
        onChange={(v) => setPw({ ...pw, confirm: v })}
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" className="btn-main" disabled={loading}>
        {loading ? "Verifying..." : "RESET PASSWORD"}
      </button>

      <SwitchRow text="Wrong email?" icon="back" label="Back" onClick={() => goTo("forgot")} />
    </form>
  );
}