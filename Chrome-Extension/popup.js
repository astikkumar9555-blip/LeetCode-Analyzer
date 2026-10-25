// Popup: on/off switch, what has been counted, and "delete all".
// Uses textContent only (never innerHTML), so stored values can never run as code.
const KEY = 'lca_effort'
const ON_KEY = 'lca_enabled'
const $ = (id) => document.getElementById(id)

async function render() {
  const store = await chrome.storage.local.get([KEY, ON_KEY])
  const enabled = store[ON_KEY] !== false
  const list = Object.values(store[KEY] || {})
  const sum = (field) => list.reduce((total, item) => total + (item[field] || 0), 0)

  $('toggle').checked = enabled
  $('state').textContent = enabled ? 'Tracking is ON for leetcode.com/problems pages.' : 'Tracking is OFF. Nothing is being counted.'

  $('s-problems').textContent = String(list.length)
  $('s-time').textContent = `${Math.round(sum('activeMs') / 60000)} min`
  $('s-edits').textContent = String(sum('edits'))
  $('s-pastes').textContent = String(sum('pastes'))
  $('s-runs').textContent = String(sum('runs'))
  $('s-submits').textContent = String(sum('submits'))

  const recent = $('recent')
  recent.replaceChildren()
  list
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, 4)
    .forEach((item) => {
      const li = document.createElement('li')
      const name = document.createElement('span')
      name.className = 'name'
      name.textContent = item.slug
      const meta = document.createElement('span')
      meta.className = 'meta'
      meta.textContent = `${item.edits} edits · ${Math.round(item.activeMs / 60000)} min`
      li.append(name, meta)
      recent.append(li)
    })
}

$('toggle').addEventListener('change', async (e) => {
  await chrome.storage.local.set({ [ON_KEY]: e.target.checked })
  render()
})

$('delete').addEventListener('click', async () => {
  if (!window.confirm('Delete all collected edit-effort data from this browser?')) return
  await chrome.storage.local.remove(KEY)
  render()
})

render()