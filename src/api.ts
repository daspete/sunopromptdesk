import type { Generated, Settings } from '../shared/settings'

let inflight: AbortController | null = null
let timer: ReturnType<typeof setTimeout> | null = null
const cache = new Map<string, Generated>()

/** Debounced, cancellable call to the server-side generator. Resolves with null when superseded. */
export function requestGeneration(settings: Settings, delay = 180): Promise<Generated | null> {
  const key = JSON.stringify(settings)
  const hit = cache.get(key)
  if (hit) return Promise.resolve(hit)
  return new Promise((resolve) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(async () => {
      inflight?.abort()
      const ctrl = new AbortController(); inflight = ctrl
      try {
        const res = await fetch('/api/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }), signal: ctrl.signal,
        })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as Generated
        cache.set(key, data)
        if (cache.size > 200) cache.delete(cache.keys().next().value!)
        resolve(data)
      } catch (e) {
        resolve((e as Error).name === 'AbortError' ? null : { prompt: '', progression: [], layers: [], suggestedLayers: [] })
      }
    }, delay)
  })
}
