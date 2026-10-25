 import { useEffect, useRef } from 'react'

// Six separate boxes for the OTP code.
// value is a plain string like "123" - digits are always filled from the left.
export default function OtpInput({ value, onChange, length = 6, disabled = false, invalid = false, focusDelay = 0 }) {
  const refs = useRef([])

  // Focus the first box after the card has finished flipping.
  useEffect(() => {
    if (focusDelay <= 0) return undefined
    const t = setTimeout(() => refs.current[0]?.focus(), focusDelay)
    return () => clearTimeout(t)
  }, [focusDelay])

  const focusAt = (i) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()

  const setDigit = (i, digit) => {
    const pos = Math.min(i, value.length)
    onChange((value.slice(0, pos) + digit + value.slice(pos + 1)).slice(0, length))
    focusAt(pos + 1)
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (value[i]) {
        onChange(value.slice(0, i) + value.slice(i + 1))
      } else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i))
        focusAt(i - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusAt(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusAt(i + 1)
    } else if (/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      setDigit(i, e.key)
    }
  }

  // Fallback for phone keyboards / autofill, which do not send normal key events.
  const handleChange = (i, e) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (!digits) return
    if (digits.length > 1) {
      const next = digits.slice(0, length)
      onChange(next)
      focusAt(next.length >= length ? length - 1 : next.length)
    } else {
      setDigit(i, digits)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    onChange(pasted)
    focusAt(Math.min(pasted.length, length - 1))
  }

  const handleFocus = (i, e) => {
    if (i > value.length) {
      focusAt(value.length) // always continue at the first empty box
      return
    }
    e.target.select()
  }

  return (
    <div className="otp" role="group" aria-label={`${length}-digit verification code`}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className={`otp-box${invalid ? ' is-invalid' : ''}`}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={value[i] ?? ''}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onChange={(e) => handleChange(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => handleFocus(i, e)}
        />
      ))}
    </div>
  )
}