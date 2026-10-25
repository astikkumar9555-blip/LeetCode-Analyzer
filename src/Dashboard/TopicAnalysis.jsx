 import { useMemo, useState } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import './TopicAnalysis.css'
import { LEVEL_LABEL, recommend, timeInsight } from './analysis.js'
import { ChevronIcon, ExternalIcon, SparkIcon } from '../Components/Icons.jsx'

const SHORT = {
  'Dynamic Programming': 'DP',
  'Binary Search': 'Bin. Search',
  'Two Pointers': '2 Pointers',
  'Linked List': 'Linked List',
}

const INTENTS = [
  { id: 'quick', label: 'Quick win', hint: 'same level as your last solve' },
  { id: 'next', label: 'Next level', hint: 'one level up (default)' },
  { id: 'challenge', label: 'Challenge me', hint: 'two levels up' },
]

export default function TopicAnalysis({ analyzed, pool }) {
  const ranked = useMemo(() => [...analyzed].sort((a, b) => b.struggle - a.struggle), [analyzed])
  const insight = useMemo(() => timeInsight(analyzed), [analyzed])
  const radarData = useMemo(() => analyzed.map((t) => ({ label: SHORT[t.name] ?? t.name, name: t.name, strength: t.strength })), [analyzed])
  const [open, setOpen] = useState(() => ranked[0]?.name ?? '')

  return (
    <div className="ta">
      {insight && (
        <p className="panel insight">
          <SparkIcon /> {insight}
        </p>
      )}

      <div className="ta-grid">
        <section className="panel" aria-label="Topic strength radar">
          <h2 className="ta-h">Topic strength</h2>
          <p className="ta-note">Higher = stronger. Based on how many tries and how much time each topic takes you.</p>
          <div className="radar-box">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#272731" />
                <PolarAngleAxis dataKey="label" tick={{ fill: '#b4b4c2', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="strength" stroke="#a79fff" strokeWidth={2} fill="#6d5df6" fillOpacity={0.3} />
                <Tooltip
                  contentStyle={{ background: '#101017', border: '1px solid #26262f', borderRadius: 10, color: '#f3f3f7', fontSize: 12 }}
                  labelStyle={{ color: '#f3f3f7' }}
                  itemStyle={{ color: '#f3f3f7' }}
                  formatter={(v) => [`${v}/100`, 'Strength']}
                  labelFormatter={(_, p) => p?.[0]?.payload?.name ?? ''}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel" aria-label="Struggle ranking">
          <h2 className="ta-h">Where you struggle most</h2>
          <p className="ta-note">Struggle score from 0 (easy for you) to 100 (very hard for you).</p>
          <ol className="rank">
            {ranked.map((t) => (
              <li key={t.name}>
                <span className="rank-name">{t.name}</span>
                <span className="rank-track" aria-hidden="true">
                  <i className={`lvl-${t.level}`} style={{ width: `${Math.max(4, t.struggle)}%` }} />
                </span>
                <span className="rank-score mono">{t.struggle}</span>
                <span className={`lvl-tag lvl-${t.level}`}>{LEVEL_LABEL[t.level]}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <Recommendation analyzed={analyzed} pool={pool} />

      <section className="panel" aria-label="Topics and solved problems">
        <h2 className="ta-h">All topics</h2>
        <p className="ta-note">Weakest first. Open a topic to see the problems you solved there.</p>
        <ul className="topics">
          {ranked.map((t) => {
            const isOpen = open === t.name
            const panelId = `topic-${t.name.replace(/\s+/g, '-')}`
            return (
              <li key={t.name} className={isOpen ? 'is-open' : ''}>
                <button
                  type="button"
                  className="topic-head"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? '' : t.name)}
                >
                  <span className="topic-name">{t.name}</span>
                  <span className="topic-counts mono">
                    {t.solved} solved · <b className="c-easy">{t.easy}E</b> <b className="c-med">{t.medium}M</b>{' '}
                    <b className="c-hard">{t.hard}H</b>
                  </span>
                  <span className="topic-strength" aria-label={`Strength ${t.strength} out of 100`}>
                    <span className="rank-track" aria-hidden="true">
                      <i className="lvl-strong-fill" style={{ width: `${t.strength}%` }} />
                    </span>
                    <span className="mono">{t.strength}</span>
                  </span>
                  <span className={`lvl-tag lvl-${t.level}`}>{LEVEL_LABEL[t.level]}</span>
                  <ChevronIcon className="chev" />
                </button>

                {isOpen && (
                  <div className="topic-panel" id={panelId}>
                    <div className="topic-stats mono">
                      <span>Accept rate {Math.round(t.acceptRate * 100)}%</span>
                      <span>Avg attempts {t.avgAttempts.toFixed(1)}</span>
                      <span>Avg time {Math.round(t.avgMinutes)} min</span>
                    </div>
                    <table className="prob-table">
                      <caption className="sr-only">Recently solved {t.name} problems</caption>
                      <thead>
                        <tr>
                          <th scope="col">Problem</th>
                          <th scope="col">Level</th>
                          <th scope="col" className="num">
                            Attempts
                          </th>
                          <th scope="col" className="num">
                            Time
                          </th>
                          <th scope="col" className="num">
                            Solved
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {t.problems.map((p) => (
                          <tr key={p.slug}>
                            <td>
                              <a href={`https://leetcode.com/problems/${p.slug}/`} target="_blank" rel="noopener noreferrer">
                                {p.title}
                              </a>
                            </td>
                            <td>
                              <span className={`diff diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                            </td>
                            <td className="num mono">{p.attempts}</td>
                            <td className="num mono">{p.minutes} min</td>
                            <td className="num mono">{p.solvedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

/* ---------- recommended next problem (2 optional questions) ---------- */

function Recommendation({ analyzed, pool }) {
  const [intent, setIntent] = useState('next') // question 1 (optional)
  const [topicName, setTopicName] = useState('') // question 2 (optional): '' = weakest topic

  const result = useMemo(() => recommend({ analyzed, pool, topicName, intent }), [analyzed, pool, topicName, intent])
  if (!result) return null
  const { topic, latest, wanted, pick, exact, alternatives } = result

  return (
    <section className="panel reco" aria-label="Recommended next problem">
      <h2 className="ta-h">
        <SparkIcon /> Recommended next problem
      </h2>

      <div className="reco-grid">
        <div className="reco-questions">
          <p className="ta-note">Two optional questions. Skip them and you get the default.</p>

          <fieldset>
            <legend>1. What kind of session do you want?</legend>
            <div className="chips" role="radiogroup" aria-label="Session type">
              {INTENTS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={intent === o.id}
                  className={`chip${intent === o.id ? ' is-on' : ''}`}
                  onClick={() => setIntent(o.id)}
                  title={o.hint}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="select-label">
            <span>2. Which topic?</span>
            <select value={topicName} onChange={(e) => setTopicName(e.target.value)}>
              <option value="">Weakest topic (default)</option>
              {analyzed.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="reco-card">
          {pick ? (
            <>
              <div className="reco-meta mono">
                {topic.name} · {topicName ? 'your choice' : 'weakest topic'}
              </div>
              <a className="reco-title" href={`https://leetcode.com/problems/${pick.slug}/`} target="_blank" rel="noopener noreferrer">
                {pick.title} <ExternalIcon />
              </a>
              <span className={`diff diff-${pick.difficulty.toLowerCase()}`}>{pick.difficulty}</span>
              <p className="reco-why">
                {latest ? (
                  <>
                    Your latest solve in {topic.name} was <b>{latest.title}</b> ({latest.difficulty}), so the target is <b>{wanted}</b>.{' '}
                  </>
                ) : null}
                {exact ? null : `No unsolved ${wanted} problem is left in our list, so this is the closest one. `}
                Your struggle score here is {topic.struggle}/100.
              </p>
              {alternatives.length > 0 && (
                <div className="reco-alt">
                  <span className="mono">Also try:</span>
                  {alternatives.map((a) => (
                    <a key={a.slug} href={`https://leetcode.com/problems/${a.slug}/`} target="_blank" rel="noopener noreferrer">
                      {a.title} <span className={`diff diff-${a.difficulty.toLowerCase()}`}>{a.difficulty}</span>
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="reco-why">You have solved everything in our sample list for {topic.name}. Pick another topic.</p>
          )}
        </div>
      </div>
    </section>
  )
}