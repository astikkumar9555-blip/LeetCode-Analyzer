// Pure counting logic. No browser APIs, no DOM, no code content - only numbers.
// Loaded before tracker.js (see manifest.json) and unit-tested on its own.
(function (root) {
  'use strict'

  const KEY = 'lca_effort' // chrome.storage.local key holding all counters
  const ON_KEY = 'lca_enabled' // chrome.storage.local key for the on/off switch
  const IDLE_MS = 30000 // a gap longer than this counts as a pause, not as working time
  const FLUSH_MS = 5000 // how often counters are saved
  const MAX_EVENTS = 60 // newest Run / Submit timestamps kept per problem

  function emptyDelta() {
    return { activeMs: 0, edits: 0, pastes: 0, runs: 0, submits: 0, pauses: 0, events: [] }
  }

  // One recorder per problem. It only ever receives "something happened at time N".
  function createRecorder() {
    let last = 0
    let delta = emptyDelta()

    function touch(now) {
      if (last) {
        const gap = now - last
        if (gap < IDLE_MS) delta.activeMs += gap
        else delta.pauses += 1
      }
      last = now
    }

    return {
      activity(now) {
        touch(now)
      },
      edit(now) {
        touch(now)
        delta.edits += 1
      },
      paste(now) {
        touch(now)
        delta.pastes += 1
      },
      run(now) {
        touch(now)
        delta.runs += 1
        delta.events.push({ type: 'run', at: now })
      },
      submit(now) {
        touch(now)
        delta.submits += 1
        delta.events.push({ type: 'submit', at: now })
      },
      // Hand over what was counted since the last call, and start again from zero.
      take() {
        const d = delta
        delta = emptyDelta()
        const has = d.activeMs > 0 || d.edits + d.pastes + d.runs + d.submits + d.pauses > 0
        return { ...d, has }
      },
    }
  }

  // Add new counts onto what is already stored for this problem.
  function mergeEffort(prev, delta, slug, now) {
    const p = prev || {
      slug,
      firstSeen: now,
      lastSeen: now,
      activeMs: 0,
      edits: 0,
      pastes: 0,
      runs: 0,
      submits: 0,
      pauses: 0,
      events: [],
    }
    return {
      slug,
      firstSeen: p.firstSeen,
      lastSeen: now,
      activeMs: p.activeMs + delta.activeMs,
      edits: p.edits + delta.edits,
      pastes: p.pastes + delta.pastes,
      runs: p.runs + delta.runs,
      submits: p.submits + delta.submits,
      pauses: p.pauses + delta.pauses,
      events: p.events.concat(delta.events).slice(-MAX_EVENTS),
    }
  }

  root.LCA_CORE = { KEY, ON_KEY, IDLE_MS, FLUSH_MS, MAX_EVENTS, createRecorder, mergeEffort }
})(typeof globalThis !== 'undefined' ? globalThis : this)