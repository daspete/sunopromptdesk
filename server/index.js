import express from 'express'
import compression from 'compression'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data', 'prompts')
const DIST_DIR = path.join(ROOT, 'dist')
const PORT = process.env.PORT || 3000

const app = express()
app.disable('x-powered-by')
app.use(compression())
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  next()
})
app.use(express.json({ limit: '64kb' }))

await fs.mkdir(DATA_DIR, { recursive: true })

const safeId = (s) => /^[a-zA-Z0-9_-]{1,80}$/.test(s)

// Save a generated prompt as a file
app.post('/api/prompts', async (req, res) => {
  const { userId, prompt, progression, settings, title } = req.body ?? {}
  if (!userId || !safeId(userId)) return res.status(400).json({ error: 'invalid userId' })
  if (typeof prompt !== 'string' || !prompt.trim()) return res.status(400).json({ error: 'prompt required' })
  if (prompt.length > 1000) return res.status(400).json({ error: 'prompt exceeds 1000 characters' })

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const record = {
    id,
    userId,
    title: typeof title === 'string' ? title.slice(0, 120) : '',
    createdAt: new Date().toISOString(),
    prompt,
    progression: Array.isArray(progression) ? progression.slice(0, 200) : [],
    settings: settings ?? {},
  }
  const userDir = path.join(DATA_DIR, userId)
  await fs.mkdir(userDir, { recursive: true })
  await fs.writeFile(path.join(userDir, `${id}.json`), JSON.stringify(record, null, 2))
  // Also a human-readable copy
  await fs.writeFile(
    path.join(userDir, `${id}.txt`),
    `${record.prompt}\n\n${record.progression.join('\n')}\n`,
  )
  res.status(201).json({ id, createdAt: record.createdAt })
})

// the API is write-only: anything else under /api is not found
app.all(/^\/api(\/.*)?$/, (_req, res) => res.status(404).json({ error: 'not found' }))

const NO_CACHE = { 'Cache-Control': 'no-cache' }
app.get('/imprint', (_req, res) => res.sendFile(path.join(DIST_DIR, 'imprint.html'), { headers: NO_CACHE }))
// hashed bundles are immutable; html/manifest/images revalidate
app.use('/assets', express.static(path.join(DIST_DIR, 'assets'), { immutable: true, maxAge: '1y', index: false }))
app.use(express.static(DIST_DIR, {
  index: 'index.html',
  setHeaders: (res, file) => {
    if (file.endsWith('.html') || file.endsWith('.webmanifest') || file.endsWith('.xml') || file.endsWith('.txt')) res.setHeader('Cache-Control', 'no-cache')
    else res.setHeader('Cache-Control', 'public, max-age=86400')
  },
}))
app.get(/.*/, async (_req, res) => {
  try {
    res.sendFile(path.join(DIST_DIR, 'index.html'), { headers: NO_CACHE })
  } catch {
    res.status(404).send('Build not found. Run `npm run build`.')
  }
})

app.listen(PORT, () => console.log(`Suno Prompt Desk server → http://localhost:${PORT}`))
