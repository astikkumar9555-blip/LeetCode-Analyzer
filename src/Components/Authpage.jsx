 import { useCallback, useEffect, useRef, useState } from 'react'
import './Auth.css'
import './AuthPage.css'
import ParallaxBackground from './ParallaxBackground.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import VerifyOtp from './VerifyOtp.jsx'
import SuccessScreen from './SuccessScreen.jsx'

const FLIP_MS = 800 // keep in sync with --flip-ms in AuthPage.css

/*
  How the flip works
  ------------------
  The card has two faces (front = 0deg, back = 180deg). Only one is visible at a time.
  To go to another page we put that page on the HIDDEN face, then rotate the whole card
  another 180deg. This works for any number of pages (login, signup, forgot, OTP, success).
*/
export default function AuthPage() {
  const [state, setState] = useState({
    angle: 0,
    flipping: false,
    slots: [{ view: 'login', key: 0, data: {} }, null],
  })
  const stateRef = useRef(state) // always the latest state, safe to read inside callbacks
  const dataRef = useRef({ email: '', mode: 'verify', notice: '' }) // info carried between pages
  const keyRef = useRef(0)
  const timerRef = useRef(null)

  const commit = useCallback((next) => {
    stateRef.current = next
    setState(next)
  }, [])

  const goTo = useCallback(
    (view, extra = {}) => {
      const cur = stateRef.current
      if (cur.flipping) return
      const hidden = 1 - ((cur.angle / 180) % 2)
      const data = { ...dataRef.current, notice: '', ...extra }
      dataRef.current = data

      const slots = [...cur.slots]
      keyRef.current += 1
      slots[hidden] = { view, key: keyRef.current, data } // new key = page starts fresh

      commit({ angle: cur.angle + 180, flipping: true, slots })
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => commit({ ...stateRef.current, flipping: false }), FLIP_MS + 60)
    },
    [commit],
  )

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const visible = (state.angle / 180) % 2

  const renderFace = (slot, ready) => {
    const { view, key, data } = slot
    switch (view) {
      case 'login':
        return (
          <Login
            key={key}
            initialEmail={data.email}
            notice={data.notice}
            onSignup={() => goTo('signup')}
            onForgot={() => goTo('forgot')}
            onNeedVerify={(email) => goTo('verify', { email, mode: 'verify' })}
          />
        )
      case 'signup':
        return (
          <Signup
            key={key}
            onLogin={() => goTo('login')}
            onCreated={(email) => goTo('verify', { email, mode: 'verify' })}
          />
        )
      case 'forgot':
        return (
          <ForgotPassword
            key={key}
            initialEmail={data.email}
            onBack={() => goTo('login')}
            onSent={(email) => goTo('verify', { email, mode: 'reset' })}
          />
        )
      case 'verify':
        return (
          <VerifyOtp
            key={key}
            email={data.email}
            mode={data.mode}
            onBack={() => goTo(data.mode === 'reset' ? 'forgot' : 'signup')}
            onSuccess={() => goTo('success')}
          />
        )
      case 'success':
        return (
          <SuccessScreen
            key={key}
            mode={data.mode}
            ready={ready}
            onDone={() =>
              goTo('login', {
                notice: data.mode === 'reset' ? 'Password updated. Log in with your new password.' : 'Email verified. You can log in now.',
              })
            }
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="auth-page">
      <ParallaxBackground />
      <div className="flip-scene">
        <div className="flip-card" style={{ transform: `rotateY(${state.angle}deg)` }}>
          {state.slots.map((slot, i) => {
            const isVisible = i === visible
            return (
              <section
                key={i}
                className={`flip-face${i === 1 ? ' flip-face--back' : ''}`}
                aria-hidden={!isVisible}
                ref={(el) => {
                  if (el) el.inert = !isVisible // hidden side cannot be tabbed into
                }}
              >
                {slot && renderFace(slot, isVisible && !state.flipping)}
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}