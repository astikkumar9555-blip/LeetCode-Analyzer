// Runs ONLY on your own dashboard address (see "matches" in manifest.json).
// It answers one question from the dashboard page: "what edit-effort numbers do you have?"
// The page and this script talk through window.postMessage, and only same-origin messages are accepted.
(function () {
  'use strict'

  const KEY = 'lca_effort'
  const ON_KEY = 'lca_enabled'

  function reply(payload) {
    window.postMessage({ source: 'lca-extension', ...payload }, window.location.origin)
  }

  window.addEventListener('message', async (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return
    const msg = event.data
    if (!msg || msg.source !== 'lca-dashboard' || msg.type !== 'get-effort') return

    try {
      const store = await chrome.storage.local.get([KEY, ON_KEY])
      reply({ type: 'effort', enabled: store[ON_KEY] !== false, effort: store[KEY] || {} })
    } catch {
      reply({ type: 'effort', enabled: false, effort: {} })
    }
  })
})()