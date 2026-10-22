import { useState } from "react";
import { Icon } from "./Icons";

export default function PasswordField({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);

  return (
    <div className="field">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
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