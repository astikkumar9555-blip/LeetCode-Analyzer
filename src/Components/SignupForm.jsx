import { useState } from "react";
import { Icon } from "./Icons";
import PasswordField from "./PasswordField";
import SwitchRow from "./SwitchRow";
import { isEmail } from "../services/authApi";

export default function SignupForm({ goTo, onSignup, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !isEmail(form.email)) {
      return setError("Enter your name and a valid email");
    }
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    if (form.password !== form.confirm) return setError("Passwords do not match");

    setLoading(true);
    setError("");
    try {
      if (onSignup) await onSignup(form); // your real signup API
      onSuccess({
        to: "login", // after the animation → back to the Login page
        title: "Account created",
        sub: "Welcome aboard — taking you to login",
        steps: ["Account created", "Profile set up", "Workspace ready"],
      });
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="icon-badge"><Icon name="user" /></div>
      <h2 className="title">Create Account</h2>
      <p className="subtitle">Start your journey with us</p>

      <div className="field">
        <input
          type="text"
          placeholder="Full Name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="field">
        <input
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <PasswordField
        placeholder="Password"
        autoComplete="new-password"
        value={form.password}
        onChange={(v) => setForm({ ...form, password: v })}
      />
      <PasswordField
        placeholder="Confirm Password"
        autoComplete="new-password"
        value={form.confirm}
        onChange={(v) => setForm({ ...form, confirm: v })}
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" className="btn-main" disabled={loading}>
        {loading ? "Please wait..." : "CREATE ACCOUNT"}
      </button>

      <SwitchRow
        text="Already have an account?"
        icon="back"
        label="Back to login"
        onClick={() => goTo("login")}
      />
    </form>
  );
}