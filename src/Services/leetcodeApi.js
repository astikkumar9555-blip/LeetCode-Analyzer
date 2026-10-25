// All LeetCode data comes through getDashboardData(username).
//
// MOCK MODE (default): realistic fake data, generated from the username, so every page can be
// built and tested now. Real LeetCode problem names are used so links open the real problems.
//
// REAL MODE (later): set  VITE_USE_MOCK=false  in the project-root .env file, then fill in
// fetchFromRealApi() below with your friend's API. It must return the SAME shape as buildMock():
//
// {
//   profile:     { username, totalSolved, easy, medium, hard, acceptanceRate (0-100),
//                  contestRating (number|null), globalRank (number|null),
//                  streak, bestStreak, activeDays, submissionsLastYear },
//   calendar:    [{ date: 'YYYY-MM-DD', count }]                      // last ~365 days, oldest first
//   topics:      [{ name, solved, easy, medium, hard,
//                   problems: [{ slug, title, difficulty, attempts, minutes, solvedAt: 'YYYY-MM-DD' }] }]
//   submissions: [{ id, slug, title, difficulty, status, time (ISO), runtime }]   // newest first
//   pool:        { [topicName]: [{ slug, title, difficulty }] }       // problems to recommend from
//   syncedAt:    number (ms), source: 'mock' | 'api'
// }

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
// const API_URL = import.meta.env.VITE_LEETCODE_API_URL
// const API_KEY = import.meta.env.VITE_LEETCODE_API_KEY

// Data is kept for 10 minutes in sessionStorage so switching pages / reloading does not call the API again.
// getDashboardData(username, { force: true }) ignores the cache (used by the refresh button).
const CACHE_MS = 10 * 60 * 1000
const cacheKey = (username) => `lca_data_${String(username).toLowerCase()}`

function readCache(username) {
  try {
    const raw = sessionStorage.getItem(cacheKey(username))
    if (!raw) return null
    const { at, data } = JSON.parse(raw)
    return Date.now() - at < CACHE_MS ? data : null
  } catch {
    return null
  }
}

function writeCache(username, data) {
  try {
    sessionStorage.setItem(cacheKey(username), JSON.stringify({ at: Date.now(), data }))
  } catch {
    /* storage full or blocked - fine, we just fetch again next time */
  }
}

export async function getDashboardData(username, { force = false } = {}) {
  if (!force) {
    const cached = readCache(username)
    if (cached) return cached
  }

  let data
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 450)) // pretend the network takes a moment
    data = buildMock(username || 'guest')
  } else {
    data = await fetchFromRealApi(username)
  }
  writeCache(username, data)
  return data
}

// eslint-disable-next-line no-unused-vars
async function fetchFromRealApi(username) {
  throw new Error(
    'The real LeetCode API is not connected yet. Fill in fetchFromRealApi() in src/Services/leetcodeApi.js, or set VITE_USE_MOCK=true.',
  )
}

/* ------------------------------------------------------------------ */
/* Problem catalog: [slug, title, difficulty]                          */
/* ------------------------------------------------------------------ */

const CATALOG_RAW = {
  Array: [
    ['two-sum', 'Two Sum', 'Easy'],
    ['best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'Easy'],
    ['contains-duplicate', 'Contains Duplicate', 'Easy'],
    ['product-of-array-except-self', 'Product of Array Except Self', 'Medium'],
    ['maximum-subarray', 'Maximum Subarray', 'Medium'],
    ['3sum', '3Sum', 'Medium'],
    ['trapping-rain-water', 'Trapping Rain Water', 'Hard'],
    ['first-missing-positive', 'First Missing Positive', 'Hard'],
  ],
  String: [
    ['valid-anagram', 'Valid Anagram', 'Easy'],
    ['longest-common-prefix', 'Longest Common Prefix', 'Easy'],
    ['group-anagrams', 'Group Anagrams', 'Medium'],
    ['longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'Medium'],
    ['longest-palindromic-substring', 'Longest Palindromic Substring', 'Medium'],
    ['minimum-window-substring', 'Minimum Window Substring', 'Hard'],
  ],
  'Two Pointers': [
    ['valid-palindrome', 'Valid Palindrome', 'Easy'],
    ['move-zeroes', 'Move Zeroes', 'Easy'],
    ['two-sum-ii-input-array-is-sorted', 'Two Sum II - Input Array Is Sorted', 'Medium'],
    ['container-with-most-water', 'Container With Most Water', 'Medium'],
    ['sort-colors', 'Sort Colors', 'Medium'],
    ['trapping-rain-water', 'Trapping Rain Water', 'Hard'],
  ],
  Stack: [
    ['valid-parentheses', 'Valid Parentheses', 'Easy'],
    ['min-stack', 'Min Stack', 'Medium'],
    ['daily-temperatures', 'Daily Temperatures', 'Medium'],
    ['evaluate-reverse-polish-notation', 'Evaluate Reverse Polish Notation', 'Medium'],
    ['largest-rectangle-in-histogram', 'Largest Rectangle in Histogram', 'Hard'],
  ],
  'Linked List': [
    ['reverse-linked-list', 'Reverse Linked List', 'Easy'],
    ['merge-two-sorted-lists', 'Merge Two Sorted Lists', 'Easy'],
    ['linked-list-cycle', 'Linked List Cycle', 'Easy'],
    ['reorder-list', 'Reorder List', 'Medium'],
    ['remove-nth-node-from-end-of-list', 'Remove Nth Node From End of List', 'Medium'],
    ['merge-k-sorted-lists', 'Merge k Sorted Lists', 'Hard'],
  ],
  'Binary Search': [
    ['binary-search', 'Binary Search', 'Easy'],
    ['search-insert-position', 'Search Insert Position', 'Easy'],
    ['sqrtx', 'Sqrt(x)', 'Easy'],
    ['search-a-2d-matrix', 'Search a 2D Matrix', 'Medium'],
    ['koko-eating-bananas', 'Koko Eating Bananas', 'Medium'],
    ['find-minimum-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array', 'Medium'],
    ['search-in-rotated-sorted-array', 'Search in Rotated Sorted Array', 'Medium'],
    ['median-of-two-sorted-arrays', 'Median of Two Sorted Arrays', 'Hard'],
    ['split-array-largest-sum', 'Split Array Largest Sum', 'Hard'],
  ],
  Tree: [
    ['maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree', 'Easy'],
    ['invert-binary-tree', 'Invert Binary Tree', 'Easy'],
    ['same-tree', 'Same Tree', 'Easy'],
    ['binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal', 'Medium'],
    ['validate-binary-search-tree', 'Validate Binary Search Tree', 'Medium'],
    ['lowest-common-ancestor-of-a-binary-tree', 'Lowest Common Ancestor of a Binary Tree', 'Medium'],
    ['binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum', 'Hard'],
    ['serialize-and-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree', 'Hard'],
  ],
  Graph: [
    ['flood-fill', 'Flood Fill', 'Easy'],
    ['find-if-path-exists-in-graph', 'Find if Path Exists in Graph', 'Easy'],
    ['number-of-islands', 'Number of Islands', 'Medium'],
    ['clone-graph', 'Clone Graph', 'Medium'],
    ['course-schedule', 'Course Schedule', 'Medium'],
    ['pacific-atlantic-water-flow', 'Pacific Atlantic Water Flow', 'Medium'],
    ['word-ladder', 'Word Ladder', 'Hard'],
    ['swim-in-rising-water', 'Swim in Rising Water', 'Hard'],
  ],
  'Dynamic Programming': [
    ['climbing-stairs', 'Climbing Stairs', 'Easy'],
    ['min-cost-climbing-stairs', 'Min Cost Climbing Stairs', 'Easy'],
    ['house-robber', 'House Robber', 'Medium'],
    ['coin-change', 'Coin Change', 'Medium'],
    ['longest-increasing-subsequence', 'Longest Increasing Subsequence', 'Medium'],
    ['unique-paths', 'Unique Paths', 'Medium'],
    ['edit-distance', 'Edit Distance', 'Hard'],
    ['burst-balloons', 'Burst Balloons', 'Hard'],
  ],
}

// Same list, but as objects: { [topic]: [{ slug, title, difficulty }] }
export const CATALOG = Object.fromEntries(
  Object.entries(CATALOG_RAW).map(([topic, list]) => [
    topic,
    list.map(([slug, title, difficulty]) => ({ slug, title, difficulty })),
  ]),
)

/* ------------------------------------------------------------------ */
/* Mock data generator                                                 */
/* ------------------------------------------------------------------ */

const EXPECTED_MINUTES = { Easy: 10, Medium: 25, Hard: 50 }

function seedFrom(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return (h ^= h >>> 16) >>> 0
}

function makeRng(str) {
  let a = seedFrom(str)
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Local date as YYYY-MM-DD (toISOString would shift the day for users east of UTC)
function isoDate(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function daysAgo(n, hour = 12) {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

function computeStreaks(calendar) {
  let best = 0
  let run = 0
  for (const day of calendar) {
    run = day.count > 0 ? run + 1 : 0
    best = Math.max(best, run)
  }
  // current streak: count back from today (or from yesterday if today has no submission yet)
  let i = calendar.length - 1
  if (calendar[i]?.count === 0) i -= 1
  let current = 0
  while (i >= 0 && calendar[i].count > 0) {
    current += 1
    i -= 1
  }
  return { current, best }
}

function buildMock(username) {
  const r = makeRng(username.toLowerCase())

  /* --- activity calendar --- */
  const streakLen = 3 + Math.floor(r() * 20)
  const calendar = []
  for (let i = 370; i >= 0; i--) {
    const d = daysAgo(i)
    const weekend = d.getDay() === 0 || d.getDay() === 6
    let count = 0
    if (i < streakLen) count = 1 + Math.floor(r() * r() * 8)
    else if (r() < (weekend ? 0.26 : 0.4) * (i < 130 ? 1.2 : 0.75)) count = 1 + Math.floor(r() * r() * 10)
    calendar.push({ date: isoDate(d), count })
  }
  const { current, best } = computeStreaks(calendar)
  const lastYear = calendar.slice(-365)

  /* --- overall numbers --- */
  const totalSolved = 90 + Math.floor(r() * 210)
  const easy = Math.round(totalSolved * (0.5 + r() * 0.15))
  const medium = Math.round(totalSolved * (0.28 + r() * 0.1))
  const hard = Math.max(0, totalSolved - easy - medium)
  const easyShare = easy / totalSolved
  const mediumShare = medium / totalSolved

  /* --- topics + the problems solved in each --- */
  const topics = Object.entries(CATALOG).map(([name, list]) => {
    const ability = 0.3 + r() * 0.65 // how good the (fake) student is at this topic
    const chance = { Easy: 0.9, Medium: 0.35 + 0.5 * ability, Hard: 0.05 + 0.3 * ability }

    const problems = []
    const make = (p) => {
      const harder = p.difficulty === 'Hard' ? 2 : p.difficulty === 'Medium' ? 1 : 0
      const attempts = 1 + Math.floor(r() * r() * (1 + (1 - ability) * 7 + harder))
      const minutes = Math.round(EXPECTED_MINUTES[p.difficulty] * (0.5 + (1 - ability) * 1.4 + r() * 0.5))
      problems.push({
        ...p,
        attempts,
        minutes,
        solvedAt: isoDate(daysAgo(Math.floor(r() * 150))),
      })
    }
    list.forEach((p) => {
      if (r() < chance[p.difficulty]) make(p)
    })
    // make sure every topic has at least 3 solved problems to analyse
    list.forEach((p) => {
      if (problems.length < 3 && !problems.some((x) => x.slug === p.slug)) make(p)
    })

    const count = (diff) => problems.filter((p) => p.difficulty === diff).length
    const solved = Math.max(problems.length, Math.round(totalSolved * (0.05 + r() * 0.18)))
    const e = Math.max(count('Easy'), Math.round(solved * easyShare))
    const m = Math.max(count('Medium'), Math.round(solved * mediumShare))
    const h = Math.max(count('Hard'), solved - e - m)

    problems.sort((a, b) => b.solvedAt.localeCompare(a.solvedAt))
    return { name, solved: e + m + h, easy: e, medium: m, hard: h, problems }
  })

  /* --- recent submissions (mostly accepted, a few failed tries) --- */
  const all = topics.flatMap((t) => t.problems).sort((a, b) => b.solvedAt.localeCompare(a.solvedAt))
  const languages = ['C++', 'Python3', 'Java', 'JavaScript']
  const submissions = []
  all.slice(0, 7).forEach((p, i) => {
    const hour = 9 + Math.floor(r() * 12)
    const solvedDate = new Date(`${p.solvedAt}T00:00:00`)
    solvedDate.setHours(hour, Math.floor(r() * 60))
    submissions.push({
      id: `ac-${i}`,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      status: 'Accepted',
      lang: languages[Math.floor(r() * languages.length)],
      time: solvedDate.toISOString(),
      runtime: `${Math.max(1, Math.round(r() * 90))} ms`,
    })
    if (p.attempts > 1) {
      const failDate = new Date(solvedDate.getTime() - (5 + Math.floor(r() * 40)) * 60000)
      submissions.push({
        id: `wa-${i}`,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        status: ['Wrong Answer', 'Time Limit Exceeded', 'Runtime Error'][Math.floor(r() * 3)],
        lang: languages[Math.floor(r() * languages.length)],
        time: failDate.toISOString(),
        runtime: 'N/A',
      })
    }
  })
  submissions.sort((a, b) => b.time.localeCompare(a.time))

  return {
    profile: {
      username,
      totalSolved,
      easy,
      medium,
      hard,
      acceptanceRate: Math.round(52 + r() * 22),
      contestRating: r() < 0.75 ? Math.round(1350 + r() * 600) : null,
      globalRank: Math.round(60000 + r() * 800000),
      streak: current,
      bestStreak: best,
      activeDays: lastYear.filter((d) => d.count > 0).length,
      submissionsLastYear: lastYear.reduce((s, d) => s + d.count, 0),
    },
    calendar,
    topics,
    submissions: submissions.slice(0, 9),
    pool: CATALOG,
    syncedAt: Date.now(),
    source: 'mock',
  }
}