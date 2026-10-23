import { useState } from "react";
import { Icon } from "./Icons";
import PasswordField from "./PasswordField";
import SwitchRow from "./SwitchRow";
import { isEmail } from "../services/authApi";

const isLeetCodeId = (v) => /^[A-Za-z0-9_.-]{1,40}$/.test(v);

export default function LoginForm({ goTo, onLogin, onSuccess }) {
  const [form, setForm] = useState({
    email: "",
    leetcodeId: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmail(form.email)) return setError("Enter a valid email address");
    if (!isLeetCodeId(form.leetcodeId.trim())) return setError("Enter a valid LeetCode user ID");
    if (!form.password) return setError("Enter your password");

    setLoading(true);
    setError("");
    try {
      // data = { email, leetcodeId, password, remember }
      if (onLogin) await onLogin({ ...form, leetcodeId: form.leetcodeId.trim() });
      onSuccess({
        to: "app", // after the animation → onAuthSuccess (your dashboard)
        title: "Verified successfully",
        sub: "Welcome back — signing you in",
        steps: ["Credentials checked", "Session secured", "Loading your dashboard"],
      });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="icon-badge"><Icon name="lock" /></div>
      <h2 className="title">Welcome</h2>
      <p className="subtitle">Login to continue your journey</p>

      <div className="field">
        <input
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div className="field">
        <input
          type="text"
          placeholder="LeetCode User ID"
          autoComplete="off"
          value={form.leetcodeId}
          onChange={(e) => setForm({ ...form, leetcodeId: e.target.value })}
        />
      </div>

      <PasswordField
        placeholder="Password"
        value={form.password}
        onChange={(v) => setForm({ ...form, password: v })}
      />

      <div className="row">
        <label className="remember">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
          />
          Remember me
        </label>
        <button type="button" className="link-btn" onClick={() => goTo("forgot")}>
          Forgot Password?
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <button type="submit" className="btn-main" disabled={loading}>
        {loading ? "Please wait..." : "Login"}
      </button>

      <SwitchRow
        text="Don't have an account?"
        icon="plus"
        label="Go to sign up"
        onClick={() => goTo("signup")}
      />
    </form>
  );
}