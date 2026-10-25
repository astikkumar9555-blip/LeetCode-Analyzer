 import { useId, useState } from 'react'
import { EyeIcon, EyeOffIcon } from './Icons.jsx'

// Password input with the show / hide eye button.
export default function PasswordField({ label, value, onChange, onBlur, error, name, autoComplete, disabled }) {
  const [show, setShow] = useState(false)
  const id = useId()
  return (
    <div className="field">
      <div className={`neu-input-wrap has-eye${error ? ' has-error' : ''}`}>
        <input
          id={id}
          className="neu-input"
          type={show ? 'text' : 'password'}
          name={name}
          placeholder={label}
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        <button
          type="button"
          className="eye-btn"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}