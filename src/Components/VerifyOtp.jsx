import { useState, useEffect } from "react";
import { Icon } from "./Icons";
import OtpInput from "./OtpInput";
import PasswordField from "./PasswordField";
import SwitchRow from "./SwitchRow";
import { sendOtp, resetPassword } from "../services/authApi";

export default function VerifyOtp({ email, goTo, onSuccess }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [pw, setPw] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  // resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await sendOtp(email);
      setCooldown(30);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return setError("Enter the 6-digit OTP");
    if (pw.password.length < 8) return setError("Password must be at least 8 characters");
    if (pw.password !== pw.confirm) return setError("Passwords do not match");

    setLoading(true);
    setError("");
    try {
      await resetPassword({ email, otp: code, password: pw.password });
      onSuccess({
        title: "Verified successfully",
        sub: "Password updated — signing you in",
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

      <p className="resend">
        Didn't get it?{" "}
        <button type="button" className="link-btn" onClick={handleResend} disabled={cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
        </button>
      </p>

      <PasswordField
        placeholder="New Password"
        value={pw.password}
        onChange={(v) => setPw({ ...pw, password: v })}
      />
      <PasswordField
        placeholder="Confirm New Password"
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