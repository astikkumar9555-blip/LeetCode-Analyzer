 import LoginForm from './LoginForm.jsx'
import SwitchRow from './SwitchRow.jsx'
import { LockIcon } from './Icons.jsx'

// Front of the card: the login page.
export default function Login({ initialEmail, notice, onSignup, onForgot, onNeedVerify }) {
  return (
    <>
      <div className="face-scroll">
        <header className="face-head">
          <div className="badge">
            <LockIcon />
          </div>
          <h1 className="face-title">Welcome</h1>
          <p className="face-sub">Login to continue your journey</p>
        </header>
        <LoginForm initialEmail={initialEmail} notice={notice} onForgot={onForgot} onNeedVerify={onNeedVerify} />
      </div>
      <footer className="face-foot">
        <SwitchRow text="Don't have an account?" label="Create an account" icon="plus" onClick={onSignup} />
      </footer>
    </>
  )
}