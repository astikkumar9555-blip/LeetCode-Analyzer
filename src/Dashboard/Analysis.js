// The "brain" of the analyzer. Pure functions, no React - easy to test and to change later.

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const EXPECTED_MINUTES = { Easy: 10, Medium: 25, Hard: 50 }

const clamp01 = (n) => Math.min(1, Math.max(0, n))
const mean = (list) => (list.length ? list.reduce((s, n) => s + n, 0) / list.length : 0)

/*
  Struggle score (0 = easy for you, 100 = very hard for you), per topic. Three signals:
    40%  how often submissions fail         (1 - accepted / all submissions)
    30%  attempts before the first accept   (1 attempt = 0, 4+ attempts = max)
    30%  time taken, compared with a normal time for that difficulty (10 / 25 / 50 min)
*/
export function analyzeTopics(topics) {
  return topics.map((t) => {
    const problems = t.problems
    const totalAttempts = problems.reduce((s, p) => s + p.attempts, 0)
    const acceptRate = problems.length ? problems.length / totalAttempts : 0
    const avgAttempts = problems.length ? totalAttempts / problems.length : 0
    const avgMinutes = mean(problems.map((p) => p.minutes))
    const timeRatio = mean(problems.map((p) => p.minutes / EXPECTED_MINUTES[p.difficulty]))

    const struggle = Math.round(
      100 * (0.4 * (1 - acceptRate) + 0.3 * clamp01((avgAttempts - 1) / 3) + 0.3 * clamp01((timeRatio - 0.5) / 2)),
    )
    const level = struggle >= 40 ? 'weak' : struggle >= 28 ? 'developing' : 'strong'

    return { ...t, acceptRate, avgAttempts, avgMinutes, timeRatio, struggle, strength: 100 - struggle, level }
  })
}

export const LEVEL_LABEL = { weak: 'Needs work', developing: 'Developing', strong: 'Strong' }

// Topic with the highest struggle score (needs at least 3 solved problems to be fair).
export function weakestTopic(analyzed) {
  const enough = analyzed.filter((t) => t.problems.length >= 3)
  const list = enough.length ? enough : analyzed
  return list.reduce((worst, t) => (!worst || t.struggle > worst.struggle ? t : worst), null)
}

// One plain-language sentence about where time goes.
export function timeInsight(analyzed) {
  const list = analyzed.filter((t) => t.problems.length >= 3)
  if (list.length < 2) return ''
  const slow = list.reduce((a, b) => (b.timeRatio > a.timeRatio ? b : a))
  const fast = list.reduce((a, b) => (b.timeRatio < a.timeRatio ? b : a))
  const x = slow.timeRatio / fast.timeRatio
  if (x < 1.25) return 'Your solving speed is fairly even across topics.'
  return `You take about ${x.toFixed(1)}x longer on ${slow.name} than on ${fast.name} (compared with a normal time for each difficulty).`
}

/*
  Recommendation:
    1. pick the topic (the weakest one, unless the student chose another)
    2. look at the difficulty of the latest problem solved in that topic
    3. suggest an unsolved problem one level higher
         intent 'quick'     -> same level as the latest solve
         intent 'next'      -> one level up (default)
         intent 'challenge' -> two levels up
*/
export function recommend({ analyzed, pool, topicName, intent = 'next' }) {
  const topic = analyzed.find((t) => t.name === topicName) ?? weakestTopic(analyzed)
  if (!topic) return null

  const solvedSlugs = new Set(analyzed.flatMap((t) => t.problems.map((p) => p.slug)))
  const latest = [...topic.problems].sort((a, b) => b.solvedAt.localeCompare(a.solvedAt))[0] ?? null
  const baseIndex = latest ? DIFFICULTIES.indexOf(latest.difficulty) : 0
  const step = intent === 'quick' ? 0 : intent === 'challenge' ? 2 : 1
  const wantedIndex = Math.min(DIFFICULTIES.length - 1, baseIndex + step)

  const ranked = (pool[topic.name] ?? [])
    .filter((p) => !solvedSlugs.has(p.slug))
    .sort((a, b) => {
      const da = Math.abs(DIFFICULTIES.indexOf(a.difficulty) - wantedIndex)
      const db = Math.abs(DIFFICULTIES.indexOf(b.difficulty) - wantedIndex)
      return da - db || DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty)
    })

  const pick = ranked[0] ?? null
  return {
    topic,
    latest,
    wanted: DIFFICULTIES[wantedIndex],
    pick,
    exact: pick ? pick.difficulty === DIFFICULTIES[wantedIndex] : false,
    alternatives: ranked.slice(1, 3),
  }
}