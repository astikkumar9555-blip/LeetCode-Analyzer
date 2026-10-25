 import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import TopicAnalysis from './TopicAnalysis.jsx'
import EditEffort from './EditEffort.jsx'
import { analyzeTopics, weakestTopic } from './analysis.js'
import { getDashboardData } from '../Services/leetcodeApi.js'
import { clearSession, getSession } from '../Components/auth.js'
import {
  CalendarIcon,
  ChartIcon,
  CodeIcon,
  ExternalIcon,
  FlameIcon,
  LayersIcon,
  LogoutIcon,
  RefreshIcon,
  TargetIcon,
  TrendIcon,
  TrophyIcon,
} from '../Components/Icons.jsx'

const NAV = [
  { id: 'overview', label: 'Overview', Icon: ChartIcon },
  { id: 'topics', label: 'Topics', Icon: LayersIcon },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const user = getSession()?.user
  const username = user?.leetcodeUsername

  const [view, setView] = useState('overview')
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState({ status: 'loading', data: null, error: '' })

  useEffect(() => {
    let alive = true
    getDashboardData(username, { force: reloadKey > 0 }) // the refresh button skips the 10-minute cache
      .then((data) => alive && setState({ status: 'ready', data, error: '' }))
      .catch((err) => alive && setState({ status: 'error', data: null, error: err.message || 'Could not load your LeetCode data.' }))
    return () => {
      alive = false
    }
  }, [username, reloadKey])

  const refresh = () => {
    setState((s) => ({ ...s, status: 'loading', error: '' }))
    setReloadKey((k) => k + 1)
  }

  const logout = () => {
    clearSession()
    navigate('/auth', { replace: true })
  }

  const { data } = state
  const analyzed = useMemo(() => (data ? analyzeTopics(data.topics) : []), [data])
  const weakest = useMemo(() => (analyzed.length ? weakestTopic(analyzed) : null), [analyzed])

  return (
    <div className="dash">
      <aside className="dash-side">
        <div className="dash-logo" aria-hidden="true">
          LA
        </div>
        <nav className="dash-nav" aria-label="Main">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`side-btn${view === id ? ' is-active' : ''}`}
              onClick={() => setView(id)}
              aria-label={label}
              aria-current={view === id ? 'page' : undefined}
              title={label}
            >
              <Icon />
            </button>
          ))}
        </nav>
        <div className="side-spacer" />
        <button type="button" className="side-btn" onClick={logout} aria-label="Log out" title="Log out">
          <LogoutIcon />
        </button>
      </aside>

      <div className="dash-main">
        <header className="dash-top">
          <div className="dash-title">
            <ChartIcon />
            <h1>{view === 'overview' ? 'Analytics' : 'Topic Analysis'}</h1>
          </div>
          <div className="dash-top-right">
            <span className="mono synced">
              {state.status === 'loading' ? 'Syncing LeetCode…' : data ? `LeetCode synced ${timeAgo(data.syncedAt)}` : ''}
            </span>
            <button type="button" className="icon-btn" onClick={refresh} aria-label="Refresh LeetCode data" title="Refresh">
              <RefreshIcon />
            </button>
            <span className="user-chip" title={user?.email}>
              {user?.name || 'You'}
            </span>
          </div>
        </header>

        <main className={`dash-content${state.status === 'loading' && data ? ' is-refreshing' : ''}`}>
          {state.status === 'loading' && !data && <LoadingState />}

          {state.status === 'error' && (
            <div className="panel state-box" role="alert">
              <h2>Could not load your data</h2>
              <p>{state.error}</p>
              <button type="button" className="btn-primary" onClick={refresh}>
                Try again
              </button>
            </div>
          )}

          {data && view === 'overview' && <Overview data={data} weakest={weakest} />}
          {data && view === 'topics' && (
            <>
              <TopicAnalysis analyzed={analyzed} pool={data.pool} />
              <EditEffort analyzed={analyzed} />
            </>
          )}
        </main>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function LoadingState() {
  return (
    <div className="panel state-box" role="status">
      <div className="spinner" aria-hidden="true" />
      <p>Loading your LeetCode data…</p>
    </div>
  )
}

function Overview({ data, weakest }) {
  const { profile, calendar, submissions } = data
  return (
    <>
      <section className="stat-grid" aria-label="Summary">
        <StatCard tone="indigo" Icon={CodeIcon} label="Total solved" value={profile.totalSolved} sub={`@${profile.username}`} />
        <StatCard tone="orange" Icon={FlameIcon} label="Streak" value={`${profile.streak}d`} sub={`Best ${profile.bestStreak}d`} />
        <StatCard tone="blue" Icon={CalendarIcon} label="Active days" value={profile.activeDays} sub="in the last 365 days" />
        <StatCard
          tone="pink"
          Icon={TargetIcon}
          label="Weakest topic"
          value={weakest ? weakest.name : '—'}
          sub={weakest ? `Struggle score ${weakest.struggle}/100` : ''}
          small
        />
      </section>

      <LeetCodeCard profile={profile} />
      <ActivityCalendar calendar={calendar} profile={profile} />
      <RecentSubmissions submissions={submissions} />
    </>
  )
}

function StatCard({ tone, Icon, label, value, sub, small }) {
  return (
    <div className={`panel stat tone-${tone}`}>
      <div className="stat-label mono">
        <Icon /> {label}
      </div>
      <div className={`stat-value${small ? ' is-small' : ''}`}>{value}</div>
      <div className="stat-sub mono">{sub}</div>
    </div>
  )
}

/* ---------- solved ring + difficulty bars ---------- */

function LeetCodeCard({ profile }) {
  const total = profile.totalSolved || 1
  const rows = [
    { key: 'Easy', value: profile.easy, color: 'var(--easy)' },
    { key: 'Medium', value: profile.medium, color: 'var(--med)' },
    { key: 'Hard', value: profile.hard, color: 'var(--hard)' },
  ]

  const R = 56
  const C = 2 * Math.PI * R
  let offset = 0
  const arcs = rows.map((row) => {
    const len = (row.value / total) * C
    const arc = { ...row, len, offset }
    offset += len
    return arc
  })

  return (
    <section className="panel leet" aria-label="LeetCode summary">
      <div className="panel-head">
        <div className="panel-title">
          <span className="chip-icon">
            <CodeIcon />
          </span>
          <h2>LeetCode</h2>
        </div>
        <a
          className="user-link mono"
          href={`https://leetcode.com/u/${encodeURIComponent(profile.username)}/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{profile.username} <ExternalIcon />
        </a>
      </div>

      <div className="leet-body">
        <div className="leet-left">
          <svg className="ring" viewBox="0 0 150 150" role="img" aria-label={`${profile.totalSolved} problems solved`}>
            <circle cx="75" cy="75" r={R} fill="none" stroke="#17171f" strokeWidth="13" />
            {arcs.map((a) => (
              <circle
                key={a.key}
                cx="75"
                cy="75"
                r={R}
                fill="none"
                stroke={a.color}
                strokeWidth="13"
                strokeDasharray={`${Math.max(0, a.len - 3)} ${C - Math.max(0, a.len - 3)}`}
                strokeDashoffset={-a.offset}
                transform="rotate(-90 75 75)"
              />
            ))}
            <text x="75" y="80" textAnchor="middle" className="ring-num">
              {profile.totalSolved}
            </text>
            <text x="75" y="98" textAnchor="middle" className="ring-cap mono">
              SOLVED
            </text>
          </svg>

          <div className="bars">
            {rows.map((row) => (
              <div className="bar-row" key={row.key}>
                <div className="bar-top">
                  <span style={{ color: row.color }}>{row.key}</span>
                  <span className="bar-count">{row.value}</span>
                </div>
                <div className="bar-track">
                  <i style={{ width: `${(row.value / total) * 100}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="leet-right">
          <div className="info-row tone-blue">
            <TargetIcon />
            <span>Acceptance rate</span>
            <strong className="mono">{profile.acceptanceRate}%</strong>
          </div>
          <div className="info-row tone-amber">
            <TrophyIcon />
            <span>Contest rating</span>
            <strong className="mono">{profile.contestRating ? profile.contestRating.toLocaleString() : '—'}</strong>
          </div>
          <div className="info-row tone-violet">
            <TrendIcon />
            <span>Global rank</span>
            <strong className="mono">{profile.globalRank ? profile.globalRank.toLocaleString() : '—'}</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- yearly activity heat-map ---------- */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const levelOf = (n) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4)

function ActivityCalendar({ calendar, profile }) {
  const { weeks, monthLabels, bestDay } = useMemo(() => {
    const pad = new Date(`${calendar[0].date}T00:00:00`).getDay() // empty cells before the first day (week starts Sunday)
    const cells = [...Array(pad).fill(null), ...calendar]
    const weekCount = Math.ceil(cells.length / 7)
    const columns = Array.from({ length: weekCount }, (_, w) => cells.slice(w * 7, w * 7 + 7))

    let lastMonth = -1
    const raw = columns.map((col) => {
      const first = col.find(Boolean)
      if (!first) return ''
      const m = Number(first.date.slice(5, 7)) - 1
      if (m === lastMonth) return ''
      lastMonth = m
      return MONTHS[m]
    })
    // drop a label if the next one is closer than 3 columns (they would overlap)
    const labels = raw.map((label, i) => {
      if (!label) return ''
      const next = raw.findIndex((l, j) => j > i && l)
      return next !== -1 && next - i < 3 ? '' : label
    })
    return { weeks: columns, monthLabels: labels, bestDay: Math.max(...calendar.map((d) => d.count)) }
  }, [calendar])

  return (
    <section className="panel" aria-label="Activity calendar">
      <div className="panel-head">
        <div className="panel-title">
          <span className="chip-icon plain">
            <CalendarIcon />
          </span>
          <h2>Activity Calendar</h2>
        </div>
      </div>

      <div className="cal-summary">
        <span>
          <strong>{profile.submissionsLastYear}</strong> submissions in the last year
        </span>
        <span className="mono">
          {profile.activeDays} active days · best {bestDay}/day
        </span>
      </div>

      <div className="cal-scroll">
        <div className="cal" role="img" aria-label={`${profile.submissionsLastYear} submissions in the last year across ${profile.activeDays} active days`}>
          <div className="cal-days mono" aria-hidden="true">
            <span />
            <span>Mon</span>
            <span />
            <span>Wed</span>
            <span />
            <span>Fri</span>
            <span />
          </div>
          <div>
            <div className="cal-months mono" style={{ gridTemplateColumns: `repeat(${weeks.length}, var(--cell))` }} aria-hidden="true">
              {monthLabels.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
            <div className="cal-grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, var(--cell))` }}>
              {weeks.map((col, w) =>
                Array.from({ length: 7 }, (_, d) => {
                  const day = col[d]
                  return day ? (
                    <i
                      key={`${w}-${d}`}
                      className={`cal-cell l${levelOf(day.count)}`}
                      title={`${day.count} submission${day.count === 1 ? '' : 's'} on ${day.date}`}
                    />
                  ) : (
                    <i key={`${w}-${d}`} className="cal-cell empty" />
                  )
                }),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="cal-legend mono" aria-hidden="true">
        less
        {[0, 1, 2, 3, 4].map((l) => (
          <i key={l} className={`cal-cell l${l}`} />
        ))}
        more
      </div>
    </section>
  )
}

/* ---------- recent submissions ---------- */

function RecentSubmissions({ submissions }) {
  return (
    <section className="panel" aria-label="Recent submissions">
      <div className="panel-head">
        <div className="panel-title">
          <span className="chip-icon plain">
            <CodeIcon />
          </span>
          <h2>Recent submissions</h2>
        </div>
      </div>
      <ul className="sub-list">
        {submissions.map((s) => (
          <li key={s.id}>
            <span className={`status-dot ${s.status === 'Accepted' ? 'ok' : 'bad'}`} aria-hidden="true" />
            <div className="sub-main">
              <a href={`https://leetcode.com/problems/${s.slug}/`} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
              <span className="sub-meta mono">
                {s.status} · {s.lang} · {s.runtime}
              </span>
            </div>
            <span className={`diff diff-${s.difficulty.toLowerCase()}`}>{s.difficulty}</span>
            <span className="sub-time mono">{timeAgo(new Date(s.time).getTime())}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function timeAgo(ms) {
  const sec = Math.max(0, Math.round((Date.now() - ms) / 1000))
  if (sec < 60) return 'just now'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  return `${day}d ago`
}