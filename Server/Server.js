//  // Server/Server.js  -  run with:  node Server/Server.js
// // Auth API for LeetCode Analyzer: signup + email OTP, login, forgot/reset password.
// // Users are stored in Server/data/users.json (simple file storage, fine for a demo / college project).

// import dotenv from 'dotenv'
// import express from 'express'
// import cors from 'cors'
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'
// import nodemailer from 'nodemailer'
// import crypto from 'node:crypto'
// import fs from 'node:fs'
// import path from 'node:path'
// import { fileURLToPath } from 'node:url'

// const __dirname = path.dirname(fileURLToPath(import.meta.url))
// dotenv.config({ path: path.join(__dirname, '.env') })

// const PORT = Number(process.env.PORT) || 5000
// const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
//   .split(',')
//   .map((s) => s.trim())
//   .filter(Boolean)

// let JWT_SECRET = process.env.JWT_SECRET
// if (!JWT_SECRET || JWT_SECRET === 'change_this_to_a_long_random_string') {
//   JWT_SECRET = crypto.randomBytes(32).toString('hex')
//   console.warn('[warn] JWT_SECRET is not set in Server/.env - using a temporary one. Logins reset when the server restarts.')
// }

// /* ------------------------------------------------------------------ */
// /* Small helpers                                                       */
// /* ------------------------------------------------------------------ */

// class HttpError extends Error {
//   constructor(status, message, extra = {}) {
//     super(message)
//     this.status = status
//     this.extra = extra
//   }
// }

// const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
// const normEmail = (v) => String(v || '').trim().toLowerCase()
// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// function fail(field, message) {
//   throw new HttpError(400, message, { field })
// }

// function checkEmail(email) {
//   if (!EMAIL_RE.test(email)) fail('email', 'Enter a valid email address')
// }

// function checkPassword(pw, field = 'password') {
//   if (typeof pw !== 'string' || pw.length < 8) fail(field, 'Use at least 8 characters')
//   if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) fail(field, 'Include a letter and a number')
//   if (pw.length > 100) fail(field, 'Password is too long')
// }

// /* ------------------------------------------------------------------ */
// /* User storage (JSON file)                                            */
// /* ------------------------------------------------------------------ */

// const DATA_DIR = path.join(__dirname, 'data')
// const USERS_FILE = path.join(DATA_DIR, 'users.json')

// function readUsers() {
//   try {
//     return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
//   } catch {
//     return []
//   }
// }

// function writeUsers(users) {
//   fs.mkdirSync(DATA_DIR, { recursive: true })
//   fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
// }

// const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, leetcodeUsername: u.leetcodeUsername })

// /* ------------------------------------------------------------------ */
// /* OTP codes (kept in memory, 10 minutes, max 5 wrong tries)           */
// /* ------------------------------------------------------------------ */

// const OTP_TTL = 10 * 60 * 1000
// const OTP_COOLDOWN = 30 * 1000
// const OTP_MAX_ATTEMPTS = 5
// const otps = new Map()

// const mailConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
// const transporter = mailConfigured
//   ? nodemailer.createTransport({
//       host: process.env.SMTP_HOST || 'smtp.gmail.com',
//       port: Number(process.env.SMTP_PORT) || 587,
//       secure: Number(process.env.SMTP_PORT) === 465,
//       auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//     })
//   : null

// async function sendOtpMail(email, code, purpose) {
//   if (!transporter) {
//     console.log(`\n[DEV] ${purpose === 'reset' ? 'Password reset' : 'Email verification'} code for ${email}:  ${code}\n`)
//     return
//   }
//   const subject = purpose === 'reset' ? 'Your password reset code' : 'Verify your email'
//   const intro = purpose === 'reset' ? 'Use this code to reset your password:' : 'Use this code to verify your email:'
//   try {
//     await transporter.sendMail({
//       from: process.env.MAIL_FROM || process.env.SMTP_USER,
//       to: email,
//       subject: `${subject} - LeetCode Analyzer`,
//       text: `${intro} ${code}\n\nIt expires in 10 minutes. If you did not request it, you can ignore this email.`,
//       html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px">
//         <h2 style="margin:0 0 8px">LeetCode Analyzer</h2>
//         <p style="color:#444">${intro}</p>
//         <p style="font-size:34px;letter-spacing:8px;font-weight:700;margin:16px 0">${code}</p>
//         <p style="color:#777;font-size:13px">It expires in 10 minutes. If you did not request it, you can ignore this email.</p>
//       </div>`,
//     })
//   } catch (err) {
//     console.error('[mail] failed to send:', err.message)
//     throw new HttpError(502, 'We could not send the email right now. Please try again in a moment.')
//   }
// }

// async function issueOtp(email, purpose) {
//   const key = `${purpose}:${email}`
//   const prev = otps.get(key)
//   const now = Date.now()
//   if (prev && now - prev.sentAt < OTP_COOLDOWN) {
//     const wait = Math.ceil((OTP_COOLDOWN - (now - prev.sentAt)) / 1000)
//     throw new HttpError(429, `Please wait ${wait}s before requesting another code.`, { code: 'COOLDOWN' })
//   }
//   const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
//   otps.set(key, { code, expires: now + OTP_TTL, attempts: 0, sentAt: now })
//   await sendOtpMail(email, code, purpose)
// }

// // Same as issueOtp, but a "wait 30s" error is not treated as a failure.
// async function issueOtpQuietly(email, purpose) {
//   try {
//     await issueOtp(email, purpose)
//   } catch (err) {
//     if (err.extra?.code !== 'COOLDOWN') throw err
//   }
// }

// function checkOtp(email, purpose, code) {
//   const key = `${purpose}:${email}`
//   const rec = otps.get(key)
//   if (!rec || rec.expires < Date.now()) {
//     otps.delete(key)
//     throw new HttpError(400, 'This code is invalid or has expired. Request a new one.', { code: 'OTP_EXPIRED' })
//   }
//   if (rec.attempts >= OTP_MAX_ATTEMPTS) {
//     otps.delete(key)
//     throw new HttpError(429, 'Too many incorrect attempts. Request a new code.', { code: 'OTP_LOCKED' })
//   }
//   if (rec.code !== String(code || '').trim()) {
//     rec.attempts += 1
//     const left = OTP_MAX_ATTEMPTS - rec.attempts
//     throw new HttpError(
//       400,
//       left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many incorrect attempts. Request a new code.',
//       { code: 'OTP_INVALID' },
//     )
//   }
//   otps.delete(key)
// }

// /* ------------------------------------------------------------------ */
// /* Tiny rate limiter (per IP)                                          */
// /* ------------------------------------------------------------------ */

// function rateLimit({ windowMs, max }) {
//   const hits = new Map()
//   setInterval(() => {
//     const now = Date.now()
//     for (const [k, v] of hits) if (v.reset < now) hits.delete(k)
//   }, windowMs).unref()

//   return (req, res, next) => {
//     const now = Date.now()
//     const rec = hits.get(req.ip)
//     if (!rec || rec.reset < now) {
//       hits.set(req.ip, { count: 1, reset: now + windowMs })
//       return next()
//     }
//     rec.count += 1
//     if (rec.count > max) {
//       res.set('Retry-After', String(Math.ceil((rec.reset - now) / 1000)))
//       return res.status(429).json({ message: 'Too many requests. Please wait a moment and try again.' })
//     }
//     next()
//   }
// }

// /* ------------------------------------------------------------------ */
// /* App + routes                                                        */
// /* ------------------------------------------------------------------ */

// const app = express()

// app.use(
//   cors({
//     origin(origin, cb) {
//       if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
//       const err = new Error('This website is not allowed to use the API.')
//       err.status = 403
//       cb(err)
//     },
//   }),
// )
// app.use(express.json({ limit: '10kb' }))
// app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 40 }))

// app.get('/api/health', (req, res) => res.json({ ok: true, mail: mailConfigured ? 'smtp' : 'console' }))

// // 1) Create account -> sends a verification code
// app.post(
//   '/api/auth/signup',
//   wrap(async (req, res) => {
//     const name = String(req.body.name || '').trim()
//     const email = normEmail(req.body.email)
//     const leetcodeUsername = String(req.body.leetcodeUsername || '').trim()
//     const password = String(req.body.password || '')

//     if (name.length < 2 || name.length > 60) fail('name', 'Enter your full name')
//     checkEmail(email)
//     if (!/^[A-Za-z0-9_-]{2,40}$/.test(leetcodeUsername)) fail('leetcodeUsername', 'Use letters, numbers, - or _ only')
//     checkPassword(password)

//     const users = readUsers()
//     const existing = users.find((u) => u.email === email)
//     if (existing?.verified) {
//       throw new HttpError(409, 'An account with this email already exists. Try logging in.', { field: 'email' })
//     }

//     const passwordHash = await bcrypt.hash(password, 10)
//     if (existing) {
//       Object.assign(existing, { name, leetcodeUsername, passwordHash })
//     } else {
//       users.push({
//         id: crypto.randomUUID(),
//         name,
//         email,
//         leetcodeUsername,
//         passwordHash,
//         verified: false,
//         createdAt: new Date().toISOString(),
//       })
//     }
//     writeUsers(users)

//     await issueOtpQuietly(email, 'verify')
//     res.status(201).json({ ok: true, email })
//   }),
// )

// // 2) Confirm the email with the OTP
// app.post(
//   '/api/auth/verify-email',
//   wrap(async (req, res) => {
//     const email = normEmail(req.body.email)
//     const users = readUsers()
//     const user = users.find((u) => u.email === email)
//     if (!user) throw new HttpError(400, 'This code is invalid or has expired. Request a new one.', { code: 'OTP_EXPIRED' })
//     checkOtp(email, 'verify', req.body.otp)
//     user.verified = true
//     writeUsers(users)
//     res.json({ ok: true })
//   }),
// )

// // 3) Login
// app.post(
//   '/api/auth/login',
//   wrap(async (req, res) => {
//     const email = normEmail(req.body.email)
//     const password = String(req.body.password || '')
//     const remember = Boolean(req.body.remember)

//     const user = readUsers().find((u) => u.email === email)
//     const ok = user ? await bcrypt.compare(password, user.passwordHash) : false
//     if (!ok) throw new HttpError(401, 'Incorrect email or password.')

//     if (!user.verified) {
//       await issueOtpQuietly(email, 'verify')
//       throw new HttpError(403, 'Please verify your email first. We sent you a new code.', { code: 'NOT_VERIFIED' })
//     }

//     const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: remember ? '30d' : '1d' })
//     res.json({ token, user: publicUser(user) })
//   }),
// )

// // 4) Forgot password -> sends reset code (always answers "ok" so emails can't be guessed)
// app.post(
//   '/api/auth/forgot',
//   wrap(async (req, res) => {
//     const email = normEmail(req.body.email)
//     checkEmail(email)
//     if (readUsers().some((u) => u.email === email)) await issueOtpQuietly(email, 'reset')
//     res.json({ ok: true, email })
//   }),
// )

// // 5) Reset password with the OTP
// app.post(
//   '/api/auth/reset',
//   wrap(async (req, res) => {
//     const email = normEmail(req.body.email)
//     const newPassword = String(req.body.newPassword || '')
//     checkPassword(newPassword, 'password')

//     const users = readUsers()
//     const user = users.find((u) => u.email === email)
//     if (!user) throw new HttpError(400, 'This code is invalid or has expired. Request a new one.', { code: 'OTP_EXPIRED' })
//     checkOtp(email, 'reset', req.body.otp)

//     user.passwordHash = await bcrypt.hash(newPassword, 10)
//     user.verified = true // they proved they own this email
//     writeUsers(users)
//     res.json({ ok: true })
//   }),
// )

// // 6) Resend a code
// app.post(
//   '/api/auth/resend',
//   wrap(async (req, res) => {
//     const email = normEmail(req.body.email)
//     const purpose = req.body.purpose === 'reset' ? 'reset' : 'verify'
//     const user = readUsers().find((u) => u.email === email)
//     const allowed = user && (purpose === 'reset' || !user.verified)
//     if (allowed) await issueOtp(email, purpose)
//     res.json({ ok: true })
//   }),
// )

// // 7) Who am I (checks the login token)
// app.get(
//   '/api/auth/me',
//   wrap(async (req, res) => {
//     const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
//     let payload
//     try {
//       payload = jwt.verify(token, JWT_SECRET)
//     } catch {
//       throw new HttpError(401, 'Please log in again.')
//     }
//     const user = readUsers().find((u) => u.id === payload.sub)
//     if (!user) throw new HttpError(401, 'Please log in again.')
//     res.json({ user: publicUser(user) })
//   }),
// )

// app.use((req, res) => res.status(404).json({ message: 'Not found' }))

// // eslint-disable-next-line no-unused-vars
// app.use((err, req, res, next) => {
//   if (err instanceof HttpError) return res.status(err.status).json({ message: err.message, ...err.extra })
//   if (err.status === 403) return res.status(403).json({ message: err.message })
//   if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid request.' })
//   console.error(err)
//   res.status(500).json({ message: 'Something went wrong on the server.' })
// })

// app.listen(PORT, () => {
//   console.log(`Auth server running on http://localhost:${PORT}`)
//   console.log(mailConfigured ? 'OTP emails: sent through SMTP' : 'OTP emails: NOT configured - codes will be printed here in the terminal')
// })

// // fixing the erro of backend responing to the frontend



// // allow requests from your frontend

// app.use(cors({
//   origin:'http://localhost:5173',
//   credentials:true
// }));






import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // or built-in fetch in Node 18+

const app = express();
app.use(cors());
app.use(express.json());

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

app.get('/api/leetcode/:username', async (req, res) => {
  const { username } = req.params;

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
          reputation
          starRating
        }
      }
      allQuestionsCount {
        difficulty
        count
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        query,
        variables: { username }
      })
    });

    const data = await response.json();

    if (data.errors || !data.data?.matchedUser) {
      return res.status(404).json({ error: 'LeetCode user not found or private profile.' });
    }

    const stats = data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
    const allCounts = data.data.allQuestionsCount;

    const easySolved = stats.find(d => d.difficulty === 'Easy')?.count || 0;
    const mediumSolved = stats.find(d => d.difficulty === 'Medium')?.count || 0;
    const hardSolved = stats.find(d => d.difficulty === 'Hard')?.count || 0;
    const totalSolved = stats.find(d => d.difficulty === 'All')?.count || (easySolved + mediumSolved + hardSolved);

    const totalEasy = allCounts.find(d => d.difficulty === 'Easy')?.count || 800;
    const totalMedium = allCounts.find(d => d.difficulty === 'Medium')?.count || 1700;
    const totalHard = allCounts.find(d => d.difficulty === 'Hard')?.count || 750;
    const totalQuestions = allCounts.find(d => d.difficulty === 'All')?.count || (totalEasy + totalMedium + totalHard);

    return res.json({
      username,
      ranking: data.data.matchedUser.profile?.ranking || 'N/A',
      totalSolved,
      totalQuestions,
      easy: { solved: easySolved, total: totalEasy },
      medium: { solved: mediumSolved, total: totalMedium },
      hard: { solved: hardSolved, total: totalHard }
    });
  } catch (err) {
    console.error('LeetCode Fetch Error:', err);
    return res.status(500).json({ error: 'Failed to fetch LeetCode data.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
