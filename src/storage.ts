import type { Settings } from './builder'

export interface SavedPrompt {
  id: string
  userId: string
  title: string
  createdAt: string
  prompt: string
  progression: string[]
  settings: Settings
  synced?: boolean
}

const USER_KEY = 'spm:userId'
const HISTORY_KEY = 'spm:history'
const DRAFT_KEY = 'spm:draft'

export function getUserId(): string {
  let id = localStorage.getItem(USER_KEY)
  if (!id) {
    id = `u_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
    localStorage.setItem(USER_KEY, id)
  }
  return id
}

export function loadHistory(): SavedPrompt[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') } catch { return [] }
}
export function saveHistory(items: SavedPrompt[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 200)))
}
export function loadDraft(): Partial<Settings> | null {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') } catch { return null }
}
export function saveDraft(s: Settings) { localStorage.setItem(DRAFT_KEY, JSON.stringify(s)) }

export async function savePromptToServer(item: SavedPrompt): Promise<SavedPrompt | null> {
  try {
    const res = await fetch('/api/prompts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: item.userId, title: item.title, prompt: item.prompt,
        progression: item.progression, settings: item.settings,
      }),
    })
    if (!res.ok) return null
    const { id, createdAt } = await res.json()
    return { ...item, id, createdAt, synced: true }
  } catch { return null }
}
