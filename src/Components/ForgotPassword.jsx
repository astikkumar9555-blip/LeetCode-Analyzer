 import { useState } from 'react'
import TextField from './TextField.jsx'
import SwitchRow from './SwitchRow.jsx'
import { AlertIcon, MailIcon } from './Icons.jsx'
import { validators } from './auth.js'
import { forgotPassword } from '../Services/authApi.js'

// Step 1 of "forgot password": ask for the email, send the OTP.
export default function ForgotPassword({ initialEmail = '', onBack, onSent }) {
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const msg = validators.email(email)
    setError(msg)
    if (msg) return
    setBusy(true)
    setFormError('')
    try {
      await forgotPassword({ email: email.trim() })
      onSent(email.trim())
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="face-scroll">
        <header className="face-head">
          <div className="badge">
            <MailIcon />
          </div>
          <h1 className="face-title">Forgot Password?</h1>
          <p className="face-sub">Enter your email and we will send you a 6-digit code</p>
        </header>

        <form onSubmit={submit} noValidate>
          {formError && (
            <p className="banner banner-error" role="alert">
              <AlertIcon /> {formError}
            </p>
          )}
          <TextField
            label="Email Address"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(v) => {
              setEmail(v)
              setError('')
            }}
            error={error}
            disabled={busy}
          />
          <button type="submit" className="neu-btn upper" disabled={busy}>
            {busy ? 'Sending…' : 'Send Code'}
          </button>
        </form>
      </div>
      <footer className="face-foot">
        <SwitchRow text="Remembered it?" label="Back to login" icon="back" onClick={onBack} />
      </footer>
    </>
  )
}