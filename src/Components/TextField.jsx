import { useId } from 'react'

// One neumorphic text input (name, email, username, ...).
export default function TextField({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  hint,
  name,
  autoComplete,
  inputMode,
  disabled,
}) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className="field">
      <div className={`neu-input-wrap${error ? ' has-error' : ''}`}>
        <input
          id={id}
          className="neu-input"
          type={type}
          name={name}
          placeholder={label}
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      </div>
      {error ? (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}