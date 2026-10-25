 import SignupForm from './SignupForm.jsx'
import SwitchRow from './SwitchRow.jsx'
import { UserIcon } from './Icons.jsx'

// Back of the card: the "Create Account" page.
export default function Signup({ onLogin, onCreated }) {
  return (
    <>
      <div className="face-scroll">
        <header className="face-head">
          <div className="badge">
            <UserIcon />
          </div>
          <h1 className="face-title">Create Account</h1>
          <p className="face-sub">Start your journey with us</p>
        </header>
        <SignupForm onCreated={onCreated} />
      </div>
      <footer className="face-foot">
        <SwitchRow text="Already have an account?" label="Back to login" icon="back" onClick={onLogin} />
      </footer>
    </>
  )
}