import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icons";

const COLORS = ["#ff5c8a", "#ffb400", "#1677e5", "#1fa97a", "#7c5cff", "#ff7a45"];
const REDIRECT_SECONDS = 6;

export default function SuccessScreen({ info, onDone }) {
  const [sec, setSec] = useState(REDIRECT_SECONDS);
  const target = info.to === "login" ? "login" : "your account";

  // countdown → when it reaches 0, AuthPage decides where to go
  useEffect(() => {
    if (sec <= 0) {
      onDone(info);
      return;
    }
    const t = setTimeout(() => setSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [sec]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        x: `${Math.random() * 100}%`,
        w: `${5 + Math.random() * 6}px`,
        h: `${8 + Math.random() * 8}px`,
        c: COLORS[i % COLORS.length],
        dur: `${3 + Math.random() * 3}s`,
        delay: `${Math.random() * 1.2}s`,
        dx: `${(Math.random() - 0.5) * 240}px`,
        rot: `${360 + Math.random() * 720}deg`,
      })),
    []
  );

  return (
    <div className="auth-form success-view">
      <div className="icon-badge ok"><Icon name="unlock" /></div>
      <h2 className="title ok-title">{info.title}</h2>
      <p className="subtitle">{info.sub}</p>

      <div className="ring-wrap">
        <svg className="ring-svg" viewBox="0 0 120 120">
          <circle className="ring-track" cx="60" cy="60" r="52" />
          <circle className="ring-bar" cx="60" cy="60" r="52" />
        </svg>
        <div className="check-core"><Icon name="check" size={42} /></div>
      </div>

      <ul className="steps">
        {info.steps.map((text, i) => (
          <li key={text} className="step" style={{ "--d": `${1 + i * 1.5}s` }}>
            <span className="tick"><Icon name="check" size={13} /></span>
            {text}
            <span className="done">Done</span>
          </li>
        ))}
      </ul>

      <p className="redirect">
        Redirecting to {target} in <b>{sec}s</b>..
      </p>
      <button type="button" className="link-btn go-now" onClick={() => onDone(info)}>
        Go now
      </button>

      {/* confetti is rendered on <body> so it covers the whole screen */}
      {createPortal(
        <div className="confetti">
          {pieces.map((p) => (
            <i
              key={p.id}
              style={{
                "--x": p.x, "--w": p.w, "--h": p.h, "--c": p.c,
                "--dur": p.dur, "--delay": p.delay, "--dx": p.dx, "--rot": p.rot,
              }}
            />
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}