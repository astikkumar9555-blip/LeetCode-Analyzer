 import { useEffect, useState } from 'react'
import OtpInput from './OtpInput.jsx'
import PasswordField from './PasswordField.jsx'
import SwitchRow from './SwitchRow.jsx'
import { AlertIcon, CheckIcon, KeyIcon } from './Icons.jsx'
import { validators } from './auth.js'
import { resendOtp, resetPassword, verifyEmail } from '../Services/authApi.js'

const RESEND_SECONDS = 30
const FLIP_WAIT = 850 // focus the first box after the card flip ends

// mode = 'verify' -> confirm the email after sign-up (OTP only)
// mode = 'reset'  -> forgot password (OTP + new password)
export default function VerifyOtp({ email, mode, onBack, onSuccess }) {
  const isReset = mode === 'reset'
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 450)
  }

  const submit = async (e) => {
    e.preventDefault()
    const next = { otp: otp.length === 6 ? '' : 'Enter the 6-digit code' }
    if (isReset) {
      next.password = validators.password(password)
      next.confirm = validators.confirm(password, confirm)
    }
    setErrors(next)
    setInfo('')
    if (Object.values(next).some(Boolean)) {
      if (next.otp) triggerShake()
      return
    }

    setBusy(true)
    setFormError('')
    try {
      if (isReset) await resetPassword({ email, otp, newPassword: password })
      else await verifyEmail({ email, otp })
      onSuccess()
    } catch (err) {
      setFormError(err.message)
      triggerShake()
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setFormError('')
    setInfo('')
    try {
      await resendOtp({ email, purpose: isReset ? 'reset' : 'verify' })
      setCooldown(RESEND_SECONDS)
      setOtp('')
      setInfo('A new code is on its way.')
    } catch (err) {
      setFormError(err.message)
    }
  }

  return (
    <>
      <div className="face-scroll">
        <header className="face-head">
          <div className="badge">
            <KeyIcon />
          </div>
          <h1 className="face-title">{isReset ? 'Verify & Reset' : 'Verify Email'}</h1>
          <p className="face-sub">
            Enter the OTP sent to <strong>{email}</strong>
          </p>
        </header>

        <form onSubmit={submit} noValidate>
          {formError && (
            <p className="banner banner-error" role="alert">
              <AlertIcon /> {formError}
            </p>
          )}
          {info && !formError && (
            <p className="banner banner-ok" role="status">
              <CheckIcon /> {info}
            </p>
          )}

          <div className={shake ? 'shake' : ''}>
            <OtpInput
              value={otp}
              onChange={(v) => {
                setOtp(v)
                setErrors((er) => ({ ...er, otp: '' }))
              }}
              invalid={Boolean(errors.otp)}
              disabled={busy}
              focusDelay={FLIP_WAIT}
            />
          </div>
          {errors.otp && <p className="field-error center">{errors.otp}</p>}

          <p className="resend">
            {cooldown > 0 ? (
              <>Didn&apos;t get it? Resend in {cooldown}s</>
            ) : (
              <>
                Didn&apos;t get it?{' '}
                <button type="button" className="link-btn" onClick={resend}>
                  Resend code
                </button>
              </>
            )}
          </p>

          {isReset && (
            <>
              <PasswordField
                label="New Password"
                name="new-password"
                autoComplete="new-password"
                value={password}
                onChange={(v) => {
                  setPassword(v)
                  setErrors((er) => ({ ...er, password: '' }))
                }}
                error={errors.password}
                disabled={busy}
              />
              <PasswordField
                label="Confirm New Password"
                name="confirm-password"
                autoComplete="new-password"
                value={confirm}
                onChange={(v) => {
                  setConfirm(v)
                  setErrors((er) => ({ ...er, confirm: '' }))
                }}
                error={errors.confirm}
                disabled={busy}
              />
            </>
          )}

          <button type="submit" className="neu-btn upper" disabled={busy}>
            {busy ? 'Checking…' : isReset ? 'Reset Password' : 'Verify'}
          </button>
        </form>
      </div>
      <footer className="face-foot">
        <SwitchRow text="Wrong email?" label="Go back" icon="back" onClick={onBack} />
      </footer>
    </>
  )
}