const KEY = 'spm:consent' // 'granted' | 'denied'

const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined
const PLAUSIBLE_SRC = (import.meta.env.VITE_PLAUSIBLE_SRC as string | undefined) || 'https://plausible.io/js/script.js'

export function getConsent(): 'granted' | 'denied' | null {
  try { return localStorage.getItem(KEY) as 'granted' | 'denied' | null } catch { return null }
}

function setConsent(v: 'granted' | 'denied') {
  try { localStorage.setItem(KEY, v) } catch { /* ignore */ }
}

let loaded = false
export function loadPlausible() {
  if (loaded || !PLAUSIBLE_DOMAIN) return
  loaded = true
  const s = document.createElement('script')
  s.defer = true
  s.dataset.domain = PLAUSIBLE_DOMAIN
  s.src = PLAUSIBLE_SRC
  document.head.appendChild(s)
  // queue function so `plausible('event')` works before the script arrives
  const w = window as unknown as { plausible?: (...a: unknown[]) => void }
  w.plausible = w.plausible || function (...args: unknown[]) { ((w.plausible as unknown as { q: unknown[] }).q = (w.plausible as unknown as { q: unknown[] }).q || []).push(args) }
}

export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (getConsent() !== 'granted') return
  const w = window as unknown as { plausible?: (n: string, o?: { props?: Record<string, string | number> }) => void }
  w.plausible?.(name, props ? { props } : undefined)
}

export function showConsentBar(force = false) {
  if (!PLAUSIBLE_DOMAIN) return
  if (!force && getConsent()) { if (getConsent() === 'granted') loadPlausible(); return }
  document.getElementById('consent')?.remove()
  const bar = document.createElement('div')
  bar.id = 'consent'
  bar.setAttribute('role', 'dialog')
  bar.setAttribute('aria-label', 'Analytics consent')
  bar.innerHTML = `
    <p>We'd like to count visits with <strong>Plausible</strong>, a cookie-free analytics tool. No personal data, no cross-site tracking. <a href="/imprint.html">Imprint &amp; privacy</a></p>
    <div class="consent-actions">
      <button type="button" class="btn" id="consentDeny">No thanks</button>
      <button type="button" class="btn primary" id="consentAllow">Allow analytics</button>
    </div>`
  document.body.appendChild(bar)
  bar.querySelector('#consentAllow')!.addEventListener('click', () => { setConsent('granted'); loadPlausible(); bar.remove() })
  bar.querySelector('#consentDeny')!.addEventListener('click', () => { setConsent('denied'); bar.remove() })
}

export function initConsent() {
  showConsentBar()
  document.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-consent-settings]')) { e.preventDefault(); showConsentBar(true) }
  })
}
