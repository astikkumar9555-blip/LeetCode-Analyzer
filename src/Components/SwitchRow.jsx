import { Icon } from "./Icons";

export default function SwitchRow({ text, icon, onClick, label }) {
  return (
    <div className="switch">
      <span>{text}</span>
      <button type="button" className="btn-round" onClick={onClick} aria-label={label}>
        <Icon name={icon} size={22} />
      </button>
    </div>
  );
}