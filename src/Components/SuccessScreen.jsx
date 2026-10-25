 import { useEffect, useRef, useState } from 'react'
import { CheckIcon, UnlockIcon } from './Icons.jsx'

const SECONDS = 6
const CONFETTI_COLORS = ['#17996a', '#ff8a5c', '#f5b800', '#6d5df6', '#1a73e8']

// Fixed values (not random) so the confetti looks the same every time.
const CONFETTI = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 29 + 7) % 100,
  delay: ((i * 13) % 20) / 10,
  duration: 2.4 + ((i * 7) % 15) / 10,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  rotate: (i * 47) % 360,
  w: 6 + (i % 3) * 2,
  h: 10 + (i % 4) * 2,
}))

// "Verified successfully" screen. When the card has finished flipping (ready = true)
// it counts 6 seconds and then calls onDone() - AuthPage flips back to the login card.
export default function SuccessScreen({ mode, ready, onDone }) {
  const isReset = mode === 'reset'
  const [left, setLeft] = useState(SECONDS)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    if (!ready) return undefined
    const end = Date.now() + SECONDS * 1000
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000))
      setLeft(remaining)
      if (remaining <= 0 && !doneRef.current) {
        doneRef.current = true
        clearInterval(id)
        onDoneRef.current()
      }
    }, 200)
    return () => clearInterval(id)
  }, [ready])

  const steps = ['Code verified', isReset ? 'Password updated' : 'Account activated', 'Securing your session']

  return (
    <div className={`success${ready ? ' is-ready' : ''}`}>
      {ready && (
        <div className="confetti" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <i
              key={i}
              style={{
                left: `${c.x}%`,
                width: c.w,
                height: c.h,
                background: c.color,
                animationDuration: `${c.duration}s`,
                animationDelay: `${c.delay}s`,
                '--r': `${c.rotate}deg`,
              }}
            />
          ))}
        </div>
      )}

      <div className="face-scroll success-body">
        <header className="face-head">
          <div className="badge badge-ok">
            <UnlockIcon />
          </div>
          <h1 className="face-title title-ok">Verified successfully</h1>
          <p className="face-sub">
            {isReset ? 'Password updated' : 'Email confirmed'} — taking you to login
          </p>
        </header>

        <div className="check-ring" aria-hidden="true">
          <div className="check-core">
            <svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path className="check-path" d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </div>
        </div>

        <ul className="steps">
          {steps.map((label, i) => (
            <li key={label} style={{ '--i': i }}>
              <span className="step-dot">
                <CheckIcon />
              </span>
              <span className="step-label">{label}</span>
              <span className="step-done">Done</span>
            </li>
          ))}
        </ul>

        <div className="redirect-bar" aria-hidden="true">
          <i />
        </div>
        <p className="redirect-text" role="status">
          Redirecting to login… <span aria-hidden="true">{ready ? `${left}s` : `${SECONDS}s`}</span>
        </p>
      </div>
    </div>
  )
}