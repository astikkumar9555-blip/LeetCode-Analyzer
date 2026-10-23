import { useState, useRef } from "react";
import "./AuthPage.css";
import ParallaxBackground from "./ParallaxBackground";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import SuccessScreen from "./SuccessScreen";

const SPIN_MS = 1100; // must match the spin360 duration in AuthPage.css

export default function AuthPage({ onLogin, onSignup, onAuthSuccess }) {
  const [view, setView] = useState("login"); // login | signup | forgot | reset | success
  const [spin, setSpin] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);
  const locked = useRef(false);

  // 360° spin: the content is swapped halfway, while the card's blank back faces you
  const goTo = (next) => {
    if (locked.current) return;
    locked.current = true;
    setSpin(true);
    setTimeout(() => setView(next), SPIN_MS / 2);
    setTimeout(() => {
      setSpin(false);
      locked.current = false;
    }, SPIN_MS);
  };

  const showSuccess = (info) => {
    setSuccessInfo(info);
    goTo("success");
  };

  // called when the 6-second countdown ends (or "Go now" is clicked)
  const finish = (info) => {
    if (info?.to === "login") {
      goTo("login");                 // password reset / sign up → Login page
    } else if (onAuthSuccess) {
      onAuthSuccess();               // login → your dashboard
    } else {
      goTo("login");
    }
  };

  const renderView = () => {
    switch (view) {
      case "login":
        return <LoginForm goTo={goTo} onLogin={onLogin} onSuccess={showSuccess} />;
      case "signup":
        return <SignupForm goTo={goTo} onSignup={onSignup} onSuccess={showSuccess} />;
      case "forgot":
        return (
          <ForgotPassword
            goTo={goTo}
            onOtpSent={(email) => {
              setResetEmail(email);
              goTo("reset");
            }}
          />
        );
      case "reset":
        return <VerifyOtp email={resetEmail} goTo={goTo} onSuccess={showSuccess} />;
      case "success":
        return <SuccessScreen info={successInfo} onDone={finish} />;
      default:
        return null;
    }
  };

  return (
    <div className={`auth-page view-${view}`}>
      <ParallaxBackground />

      <div className="flip-scene">
        <div className={`flip-card ${spin ? "spin" : ""}`}>
          <div className="face face-front">{renderView()}</div>
          <div className="face face-back" />
        </div>
      </div>
    </div>
  );
}