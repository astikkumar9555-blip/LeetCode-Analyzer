 // Helpers shared by the auth screens: login session storage + form validation.

const KEY = 'lca_session'

// remember = true  -> stays logged in after the browser closes (localStorage)
// remember = false -> logged out when the tab/browser closes (sessionStorage)
export function saveSession({ token, user }, remember) {
  clearSession()
  const store = remember ? localStorage : sessionStorage
  store.setItem(KEY, JSON.stringify({ token, user }))
}

export function getSession() {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
    sessionStorage.removeItem(KEY)
  } catch {
    /* storage can be blocked - nothing to clear */
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Each validator returns an error message, or '' when the value is fine.
export const validators = {
  name: (v) => (!v.trim() ? 'Enter your full name' : v.trim().length < 2 ? 'Name is too short' : ''),
  email: (v) => (!v.trim() ? 'Enter your email address' : !EMAIL_RE.test(v.trim()) ? 'Enter a valid email address' : ''),
  leetcode: (v) =>
    !v.trim()
      ? 'Enter your LeetCode username'
      : !/^[A-Za-z0-9_-]{2,40}$/.test(v.trim())
        ? 'Use letters, numbers, - or _ only'
        : '',
  password: (v) =>
    !v
      ? 'Enter a password'
      : v.length < 8
        ? 'Use at least 8 characters'
        : !(/[A-Za-z]/.test(v) && /\d/.test(v))
          ? 'Include a letter and a number'
          : '',
  confirm: (password, v) => (!v ? 'Confirm your password' : password !== v ? 'Passwords do not match' : ''),
}

// 0 (empty) to 4 (strong) - only used for the small strength bar on the signup form.
export function passwordStrength(pw) {
  if (!pw) return { score: 0, label: '' }
  let score = 0
  if (pw.length >= 8) score += 1
  if (pw.length >= 12) score += 1
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1
  const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong']
  return { score: Math.max(1, score), label: labels[Math.max(1, score)] }
}