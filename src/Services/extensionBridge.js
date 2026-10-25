// Talks to the Chrome extension (extension/ folder) through window.postMessage.
// The extension adds a small script to THIS dashboard's address (see extension/manifest.json).
// If the extension is not installed, nobody answers and we report { installed: false }.

export function requestEffort(timeoutMs = 1200) {
  return new Promise((resolve) => {
    let finished = false

    const finish = (result) => {
      if (finished) return
      finished = true
      window.removeEventListener('message', onMessage)
      clearTimeout(timer)
      resolve(result)
    }

    const onMessage = (event) => {
      if (event.source !== window || event.origin !== window.location.origin) return
      const msg = event.data
      if (!msg || msg.source !== 'lca-extension' || msg.type !== 'effort') return
      finish({ installed: true, enabled: msg.enabled !== false, effort: msg.effort || {} })
    }

    window.addEventListener('message', onMessage)
    const timer = setTimeout(() => finish({ installed: false, enabled: false, effort: {} }), timeoutMs)
    window.postMessage({ source: 'lca-dashboard', type: 'get-effort' }, window.location.origin)
  })
}