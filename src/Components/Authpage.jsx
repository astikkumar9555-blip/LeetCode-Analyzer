import React, { useState } from "react";
import "./AuthPage.css";

/* ---------- small inline icons (no extra packages needed) ---------- */
const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
    <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4V7Z" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

/* ---------- main component ---------- */
export default function AuthPage({ onLogin, onSignup }) {
  const [isSignup, setIsSignup] = useState(false);

  const [login, setLogin] = useState({ email: "", password: "", remember: false });
  const [signup, setSignup] = useState({ name: "", email: "", password: "", confirm: "" });

  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [error, setError] = useState("");

  const flip = () => {
    setError("");
    setIsSignup((v) => !v);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!login.email || !login.password) return setError("Please fill in all fields");
    setError("");
    onLogin && onLogin(login); // connect to your API / auth logic here
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!signup.name || !signup.email || !signup.password) return setError("Please fill in all fields");
    if (signup.password !== signup.confirm) return setError("Passwords do not match");
    setError("");
    onSignup && onSignup(signup); // connect to your API / auth logic here
  };

  return (
    <div className="auth-page">
      {/* decorative circles - OUTSIDE the flipping card so the background stays still */}
      <span className="deco deco-1" />
      <span className="deco deco-2" />
      <span className="deco deco-3" />

      <div className="flip-scene">
        <div className={`flip-card ${isSignup ? "is-flipped" : ""}`}>
          {/* ================= FRONT : LOGIN ================= */}
          <div className={`face face-front ${isSignup ? "face-hidden" : ""}`}>
            <form className="auth-form" onSubmit={handleLogin} noValidate>
              <div className="icon-badge"><LockIcon /></div>
              <h2 className="title">Welcome</h2>
              <p className="subtitle">Login to continue your journey</p>

              <div className="field">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={login.email}
                  onChange={(e) => setLogin({ ...login, email: e.target.value })}
                />
              </div>

              <div className="field">
                <input
                  type={showLoginPw ? "text" : "password"}
                  placeholder="Password"
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                />
                <button type="button" className="eye" onClick={() => setShowLoginPw((v) => !v)} aria-label="Toggle password">
                  <EyeIcon off={showLoginPw} />
                </button>
              </div>

              <div className="row">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={login.remember}
                    onChange={(e) => setLogin({ ...login, remember: e.target.checked })}
                  />
                  Remember me
                </label>
                <a href="#forgot" className="link">Forgot Password?</a>
              </div>

              {!isSignup && error && <p className="error">{error}</p>}

              <button type="submit" className="btn-main">Login</button>

              <div className="switch">
                <span>Don't have an account?</span>
                <button type="button" className="btn-round" onClick={flip} aria-label="Go to sign up">
                  <PlusIcon />
                </button>
              </div>
            </form>
          </div>

          {/* ================= BACK : SIGN UP ================= */}
          <div className={`face face-back ${!isSignup ? "face-hidden" : ""}`}>
            <form className="auth-form" onSubmit={handleSignup} noValidate>
              <div className="icon-badge"><UserIcon /></div>
              <h2 className="title">Create Account</h2>
              <p className="subtitle">Start your journey with us</p>

              <div className="field">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signup.name}
                  onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                />
              </div>

              <div className="field">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={signup.email}
                  onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                />
              </div>

              <div className="field">
                <input
                  type={showSignupPw ? "text" : "password"}
                  placeholder="Password"
                  value={signup.password}
                  onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                />
                <button type="button" className="eye" onClick={() => setShowSignupPw((v) => !v)} aria-label="Toggle password">
                  <EyeIcon off={showSignupPw} />
                </button>
              </div>

              <div className="field">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={signup.confirm}
                  onChange={(e) => setSignup({ ...signup, confirm: e.target.value })}
                />
              </div>

              {isSignup && error && <p className="error">{error}</p>}

              <button type="submit" className="btn-main">CREATE ACCOUNT</button>

              <div className="switch">
                <span>Already have an account?</span>
                <button type="button" className="btn-round" onClick={flip} aria-label="Back to login">
                  <ArrowLeftIcon />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}