 import { useState } from 'react'
import TextField from './TextField.jsx'
import PasswordField from './PasswordField.jsx'
import { AlertIcon } from './Icons.jsx'
import { passwordStrength, validators } from './auth.js'
import { signup } from '../Services/authApi.js'

export default function SignupForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', leetcodeUsername: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((er) => ({ ...er, [key]: '' }))
  }

  const strength = passwordStrength(form.password)

  const submit = async (e) => {
    e.preventDefault()
    const next = {
      name: validators.name(form.name),
      email: validators.email(form.email),
      leetcodeUsername: validators.leetcode(form.leetcodeUsername),
      password: validators.password(form.password),
      confirm: validators.confirm(form.password, form.confirm),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return

    setBusy(true)
    setFormError('')
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        leetcodeUsername: form.leetcodeUsername.trim(),
        password: form.password,
      })
      onCreated(form.email.trim())
    } catch (err) {
      if (err.field) setErrors((er) => ({ ...er, [err.field]: err.message }))
      else setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {formError && (
        <p className="banner banner-error" role="alert">
          <AlertIcon /> {formError}
        </p>
      )}

      <TextField
        label="Full Name"
        name="name"
        autoComplete="name"
        value={form.name}
        onChange={set('name')}
        error={errors.name}
        disabled={busy}
      />
      <TextField
        label="Email Address"
        type="email"
        name="email"
        autoComplete="email"
        value={form.email}
        onChange={set('email')}
        error={errors.email}
        disabled={busy}
      />
      <TextField
        label="LeetCode Username"
        name="leetcodeUsername"
        autoComplete="off"
        value={form.leetcodeUsername}
        onChange={set('leetcodeUsername')}
        error={errors.leetcodeUsername}
        hint="Only your public LeetCode stats are read. Never enter your LeetCode password here."
        disabled={busy}
      />
      <PasswordField
        label="Password"
        name="new-password"
        autoComplete="new-password"
        value={form.password}
        onChange={set('password')}
        error={errors.password}
        disabled={busy}
      />
      {form.password && (
        <div className="strength" aria-live="polite">
          <div className="strength-bar" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <i key={n} className={n <= strength.score ? `on s${strength.score}` : ''} />
            ))}
          </div>
          <span>Password strength: {strength.label}</span>
        </div>
      )}
      <PasswordField
        label="Confirm Password"
        name="confirm-password"
        autoComplete="new-password"
        value={form.confirm}
        onChange={set('confirm')}
        error={errors.confirm}
        disabled={busy}
      />

      <button type="submit" className="neu-btn upper" disabled={busy}>
        {busy ? 'Creating…' : 'Create Account'}
      </button>
    </form>
  )
}