 import { useEffect, useRef } from 'react'
import './ParallaxBackground.css'

// size = px, x / y = position in %, depth = how far it moves with the mouse (px)
const ORBS = [
  { size: 260, x: 7, y: 4, depth: 26, kind: 'raised' },
  { size: 380, x: -9, y: 44, depth: 16, kind: 'ring' },
  { size: 120, x: 15, y: 62, depth: 34, kind: 'ring' },
  { size: 84, x: 66, y: 7, depth: 40, kind: 'raised' },
  { size: 50, x: 91, y: 9, depth: 48, kind: 'raised' },
  { size: 220, x: 76, y: 46, depth: 22, kind: 'raised' },
  { size: 96, x: 61, y: 80, depth: 36, kind: 'raised' },
  { size: 150, x: 33, y: -7, depth: 20, kind: 'raised' },
  { size: 64, x: 86, y: 82, depth: 44, kind: 'ring' },
]

export default function ParallaxBackground() {
  const rootRef = useRef(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const onMove = (e) => {
      el.style.setProperty('--mx', ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3))
      el.style.setProperty('--my', ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3))
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="pbg" ref={rootRef} aria-hidden="true">
      {ORBS.map((o, i) => (
        <span
          key={i}
          className="pbg-orb"
          style={{
            width: o.size,
            height: o.size,
            left: `${o.x}%`,
            top: `${o.y}%`,
            '--d': o.depth,
          }}
        >
          <span className={`pbg-shape pbg-${o.kind}`} style={{ animationDelay: `${-i * 1.7}s` }} />
        </span>
      ))}
    </div>
  )
}