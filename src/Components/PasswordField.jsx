import { useState } from "react";
import { Icon } from "./Icons";

// status: "" | "ok" | "bad"  → green / red ring around the box
export default function PasswordField({
  placeholder,
  value,
  onChange,
  autoComplete = "current-password",
  status = "",
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={`field ${status}`}>
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="eye"
        onClick={() => setShow((v) => !v)}
        aria-label="Toggle password visibility"
      >
        <Icon name={show ? "eyeOff" : "eye"} size={18} />
      </button>
    </div>
  );
}