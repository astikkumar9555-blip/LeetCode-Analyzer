 import './ParallaxBackground.css'

// size = px, x / y = position in %
// Static background: the circles do not move and do not react to the mouse.
const ORBS = [
  { size: 260, x: 7, y: 4, kind: 'raised' },
  { size: 380, x: -9, y: 44, kind: 'ring' },
  { size: 120, x: 15, y: 62, kind: 'ring' },
  { size: 84, x: 66, y: 7, kind: 'raised' },
  { size: 50, x: 91, y: 9, kind: 'raised' },
  { size: 220, x: 76, y: 46, kind: 'raised' },
  { size: 96, x: 61, y: 80, kind: 'raised' },
  { size: 150, x: 33, y: -7, kind: 'raised' },
  { size: 64, x: 86, y: 82, kind: 'ring' },
]

export default function ParallaxBackground() {
  return (
    <div className="pbg" aria-hidden="true">
      {ORBS.map((o, i) => (
        <span
          key={i}
          className="pbg-orb"
          style={{ width: o.size, height: o.size, left: `${o.x}%`, top: `${o.y}%` }}
        >
          <span className={`pbg-shape pbg-${o.kind}`} />
        </span>
      ))}
    </div>
  )
}