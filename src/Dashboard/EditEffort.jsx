import { useEffect, useMemo, useState } from 'react'
import { requestEffort } from '../Services/extensionBridge.js'
import { CodeIcon } from '../Components/Icons.jsx'

// Shows where you spend effort while coding, using the numbers collected by the Chrome extension.
// Only counts are shown (edits, pastes, runs, submits, time). Your code is never collected.

const prettify = (slug) => slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

function buildRows(effort, analyzed) {
  const info = new Map() // slug -> { title, topic }
  analyzed.forEach((t) =>
    t.problems.forEach((p) => {
      if (!info.has(p.slug)) info.set(p.slug, { title: p.title, topic: t.name })
    }),
  )

  return Object.values(effort)
    .map((e) => {
      const known = info.get(e.slug)
      const firstSubmit = e.events.find((x) => x.type === 'submit')
      const runsBeforeSubmit = e.events.filter((x) => x.type === 'run' && (!firstSubmit || x.at < firstSubmit.at)).length
      return {
        ...e,
        title: known?.title ?? prettify(e.slug),
        topic: known?.topic ?? '—',
        minutes: Math.round(e.activeMs / 6000) / 10, // one decimal
        runsBeforeSubmit,
      }
    })
    .sort((a, b) => b.activeMs - a.activeMs)
}

function topicSentence(rows) {
  const byTopic = new Map()
  rows
    .filter((r) => r.topic !== '—')
    .forEach((r) => {
      const t = byTopic.get(r.topic) ?? { name: r.topic, edits: 0, minutes: 0, count: 0 }
      t.edits += r.edits
      t.minutes += r.minutes
      t.count += 1
      byTopic.set(r.topic, t)
    })
  const list = [...byTopic.values()].filter((t) => t.count >= 1)
  if (!list.length) return ''
  const top = list.reduce((a, b) => (b.minutes / b.count > a.minutes / a.count ? b : a))
  return `You spend the most active coding time per problem in ${top.name}: about ${(top.minutes / top.count).toFixed(1)} min and ${Math.round(top.edits / top.count)} edits on average.`
}

export default function EditEffort({ analyzed }) {
  const [state, setState] = useState({ status: 'checking', enabled: true, effort: {} })

  useEffect(() => {
    let alive = true
    requestEffort().then((r) => {
      if (alive) setState({ status: r.installed ? 'ready' : 'missing', enabled: r.enabled, effort: r.effort })
    })
    return () => {
      alive = false
    }
  }, [])

  const rows = useMemo(() => buildRows(state.effort, analyzed), [state.effort, analyzed])
  const sentence = useMemo(() => topicSentence(rows), [rows])

  return (
    <section className="panel" aria-label="Edit effort">
      <h2 className="ta-h">
        <CodeIcon /> Edit effort
      </h2>
      <p className="ta-note">
        Where your time and edits go while coding, measured by the LeetCode Analyzer Chrome extension. Only counts are
        collected, never your code.
      </p>

      {state.status === 'checking' && <p className="ta-note">Looking for the extension…</p>}

      {state.status === 'missing' && (
        <div className="ext-help">
          <p>The extension was not found in this browser. To turn this section on:</p>
          <ol>
            <li>Open <code>chrome://extensions</code> and switch on <b>Developer mode</b>.</li>
            <li>Click <b>Load unpacked</b> and choose the <code>extension</code> folder of this project.</li>
            <li>Reload this page, then solve a problem on leetcode.com.</li>
          </ol>
        </div>
      )}

      {state.status === 'ready' && !state.enabled && (
        <p className="ext-note">Tracking is switched off in the extension popup. Switch it on to collect new data.</p>
      )}

      {state.status === 'ready' && rows.length === 0 && (
        <p className="ext-note">
          The extension is connected. Open a problem on leetcode.com and start coding; your numbers will show up here.
        </p>
      )}

      {rows.length > 0 && (
        <>
          {sentence && <p className="effort-sentence">{sentence}</p>}
          <div className="table-scroll">
            <table className="prob-table">
              <caption className="sr-only">Edit effort per problem, most active time first</caption>
              <thead>
                <tr>
                  <th scope="col">Problem</th>
                  <th scope="col">Topic</th>
                  <th scope="col" className="num">Active time</th>
                  <th scope="col" className="num">Edits</th>
                  <th scope="col" className="num">Pastes</th>
                  <th scope="col" className="num">Runs</th>
                  <th scope="col" className="num">Submits</th>
                  <th scope="col" className="num">Pauses</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r) => (
                  <tr key={r.slug}>
                    <td>
                      <a href={`https://leetcode.com/problems/${r.slug}/`} target="_blank" rel="noopener noreferrer">
                        {r.title}
                      </a>
                    </td>
                    <td>{r.topic}</td>
                    <td className="num mono">{r.minutes} min</td>
                    <td className="num mono">{r.edits}</td>
                    <td className="num mono">{r.pastes}</td>
                    <td className="num mono">{r.runs}</td>
                    <td className="num mono">{r.submits}</td>
                    <td className="num mono">{r.pauses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ta-note effort-foot">
            An edit is a key press that changes text. A pause is a gap of 30 seconds or more without activity.
          </p>
        </>
      )}
    </section>
  )
}