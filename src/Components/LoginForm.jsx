 import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TextField from './TextField.jsx'
import PasswordField from './PasswordField.jsx'
import { AlertIcon, CheckIcon } from './Icons.jsx'
import { saveSession, validators } from './auth.js'
import { login } from '../Services/authApi.js'

export default function LoginForm({ initialEmail = '', notice = '', onForgot, onNeedVerify }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const next = { email: validators.email(email), password: password ? '' : 'Enter your password' }
    setErrors(next)
    if (next.email || next.password) return

    setBusy(true)
    setFormError('')
    try {
      const data = await login({ email, password, remember })
      saveSession(data, remember)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err.code === 'NOT_VERIFIED') onNeedVerify(email.trim())
      else setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {notice && !formError && (
        <p className="banner banner-ok" role="status">
          <CheckIcon /> {notice}
        </p>
      )}
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
          setErrors((er) => ({ ...er, email: '' }))
        }}
        error={errors.email}
        disabled={busy}
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(v) => {
          setPassword(v)
          setErrors((er) => ({ ...er, password: '' }))
        }}
        error={errors.password}
        disabled={busy}
      />

      <div className="row-between">
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Remember me</span>
        </label>
        <button type="button" className="link-btn" onClick={onForgot}>
          Forgot Password?
        </button>
      </div>

      <button type="submit" className="neu-btn" disabled={busy}>
        {busy ? 'Signing in…' : 'Login'}
      </button>
    </form>
  )
}