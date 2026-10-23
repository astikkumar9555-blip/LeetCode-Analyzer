import { useRef, useEffect } from "react";

export default function OtpInput({ otp, setOtp }) {
  const refs = useRef([]);

  // focus the first box when the page opens
  useEffect(() => {
    const t = setTimeout(() => refs.current[0]?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...otp];
      if (next[i]) {
        next[i] = "";
      } else if (i > 0) {
        next[i - 1] = "";
        refs.current[i - 1]?.focus();
      }
      setOtp(next);
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = Array(6).fill("");
    text.split("").forEach((c, idx) => (next[idx] = c));
    setOtp(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <div className="otp-row" onPaste={handlePaste}>
      {otp.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={d ? "filled" : ""}
          value={d}
          inputMode="numeric"
          autoComplete="off"
          maxLength={1}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
}