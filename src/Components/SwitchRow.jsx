 import { ArrowLeftIcon, PlusIcon } from './Icons.jsx'

// The small row at the bottom of each card: "Don't have an account? (+)"
// icon = 'plus' (go forward to create) or 'back' (go back)
export default function SwitchRow({ text, label, icon = 'plus', onClick, disabled }) {
  return (
    <div className="switch-row">
      <span>{text}</span>
      <button type="button" className="round-btn" onClick={onClick} aria-label={label} title={label} disabled={disabled}>
        {icon === 'back' ? <ArrowLeftIcon /> : <PlusIcon />}
      </button>
    </div>
  )
}