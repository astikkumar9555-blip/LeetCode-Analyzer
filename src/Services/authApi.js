 // All calls to your own Server/Server.js live here.
// To point the app at another server, set VITE_API_URL in a .env file in the project root,
// for example:  VITE_API_URL=http://localhost:5000/api

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message)
    this.status = status
    this.code = data.code
    this.field = data.field
  }
}

async function request(path, { method = 'POST', body, token } = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Start it with: node Server/Server.js', 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.message || 'Something went wrong. Please try again.', res.status, data)
  return data
}

export const signup = ({ name, email, leetcodeUsername, password }) =>
  request('/auth/signup', { body: { name, email, leetcodeUsername, password } })

export const verifyEmail = ({ email, otp }) => request('/auth/verify-email', { body: { email, otp } })

export const login = ({ email, password, remember }) => request('/auth/login', { body: { email, password, remember } })

export const forgotPassword = ({ email }) => request('/auth/forgot', { body: { email } })

export const resetPassword = ({ email, otp, newPassword }) =>
  request('/auth/reset', { body: { email, otp, newPassword } })

export const resendOtp = ({ email, purpose }) => request('/auth/resend', { body: { email, purpose } })

export const getMe = (token) => request('/auth/me', { method: 'GET', token })