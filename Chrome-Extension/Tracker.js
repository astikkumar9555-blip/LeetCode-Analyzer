// Runs on https://leetcode.com/problems/* only.
//
// PRIVACY RULES (do not break these):
//  - It never reads, copies or stores the code in the editor.
//  - It never reads the clipboard, cookies, tokens, or any page text.
//  - A key press is only CLASSIFIED ("does this change text?") and counted. Which key it was is never saved.
//  - Everything is saved in chrome.storage.local (this browser only). Nothing is sent anywhere.
(function () {
  'use strict'

  const { KEY, ON_KEY, FLUSH_MS, createRecorder, mergeEffort } = globalThis.LCA_CORE

  const recorders = new Map() // problem slug -> recorder
  let enabled = true
  let flushing = false

  try {
    chrome.storage.local.get(ON_KEY).then((s) => {
      enabled = s[ON_KEY] !== false
    })
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[ON_KEY]) enabled = changes[ON_KEY].newValue !== false
    })
  } catch {
    return // extension was reloaded; this page needs a refresh
  }

  // LeetCode is a single-page app, so the problem can change without a page reload.
  const currentSlug = () => (location.pathname.match(/^\/problems\/([^/]+)/) || [])[1] || null
  const inEditor = (target) => target instanceof Element && Boolean(target.closest('.monaco-editor'))

  function recorderFor(slug) {
    let r = recorders.get(slug)
    if (!r) {
      r = createRecorder()
      recorders.set(slug, r)
    }
    return r
  }

  // true for keys that change the text (letters, digits, symbols, Backspace, Delete, Enter, Tab)
  function changesText(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return false
    return e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Enter' || e.key === 'Tab'
  }

  function buttonKind(el) {
    const locator = el.getAttribute('data-e2e-locator')
    if (locator === 'console-run-button') return 'run'
    if (locator === 'console-submit-button') return 'submit'
    // fallback if LeetCode renames the attribute: look at the button label only
    const label = (el.textContent || '').trim().toLowerCase()
    if (label === 'run') return 'run'
    if (label === 'submit') return 'submit'
    return null
  }

  document.addEventListener(
    'keydown',
    (e) => {
      const slug = currentSlug()
      if (!slug || !enabled || !inEditor(e.target)) return
      const r = recorderFor(slug)
      if (changesText(e)) r.edit(Date.now())
      else r.activity(Date.now())
    },
    true,
  )

  document.addEventListener(
    'paste',
    (e) => {
      const slug = currentSlug()
      if (!slug || !enabled || !inEditor(e.target)) return
      recorderFor(slug).paste(Date.now()) // counts the paste only - the clipboard is never read
    },
    true,
  )

  document.addEventListener(
    'click',
    (e) => {
      const slug = currentSlug()
      if (!slug || !enabled || !(e.target instanceof Element)) return
      const button = e.target.closest('button, [role="button"]')
      if (button) {
        const kind = buttonKind(button)
        if (kind === 'run') return recorderFor(slug).run(Date.now())
        if (kind === 'submit') return recorderFor(slug).submit(Date.now())
      }
      if (inEditor(e.target)) recorderFor(slug).activity(Date.now())
    },
    true,
  )

  async function flush() {
    if (flushing) return
    flushing = true
    try {
      for (const [slug, recorder] of recorders) {
        const delta = recorder.take()
        if (!delta.has || !enabled) continue
        const stored = (await chrome.storage.local.get(KEY))[KEY] || {}
        stored[slug] = mergeEffort(stored[slug], delta, slug, Date.now())
        await chrome.storage.local.set({ [KEY]: stored })
      }
    } catch {
      /* extension reloaded or storage unavailable - skip this round */
    } finally {
      flushing = false
    }
  }

  setInterval(flush, FLUSH_MS)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
  window.addEventListener('pagehide', flush)
})()