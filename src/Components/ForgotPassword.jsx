import { useState } from "react";
import { Icon } from "./Icons";
import SwitchRow from "./SwitchRow";
import { isEmail, sendOtp } from "../services/authApi";

export default function ForgotPassword({ goTo, onOtpSent }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) return setError("Enter a valid email address");

    setLoading(true);
    setError("");
    try {
      await sendOtp(email);   // emails the OTP (see services/authApi.js)
      onOtpSent(email);       // AuthPage remembers the email and opens the OTP page
    } catch (err) {
      setError(err.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="icon-badge"><Icon name="mail" /></div>
      <h2 className="title">Forgot Password?</h2>
      <p className="subtitle">Enter your Gmail and we'll send you a 6-digit OTP</p>

      <div className="field">
        <input
          type="email"
          placeholder="Gmail Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <p className="info">The code is valid for 5 minutes. Check your Inbox and Spam folder.</p>

      {error && <p className="error">{error}</p>}

      <button type="submit" className="btn-main" disabled={loading}>
        {loading ? "Sending..." : "SEND OTP"}
      </button>

      <SwitchRow
        text="Remember your password?"
        icon="back"
        label="Back to login"
        onClick={() => goTo("login")}
      />
    </form>
  );
}