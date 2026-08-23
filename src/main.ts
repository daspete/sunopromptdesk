import './style.css'
import {
  ARRANGEMENT_GROUPS, ERAS, GENRE_GROUPS, INSTRUMENT_GROUPS, KEYS, MOOD_GROUPS, PRODUCTION_GROUPS, PROGRESSION_GROUPS, SCALES, VOCAL_GROUPS, type Option, type OptionGroup,
} from './data'
import { DEFAULT_SETTINGS, LAYER_ENTRIES, MAX_LENGTH, MAX_PROMPT, autoLayers, buildLayers, buildProgression, buildPrompt, newSeed, type Settings } from './builder'
import {
  getUserId, loadDraft, loadHistory, saveDraft, saveHistory, savePromptToServer, type SavedPrompt,
} from './storage'
import { initConsent, trackEvent } from './consent'

const userId = getUserId()
const migrate = (p: Partial<Settings> & { bpm?: number }): Partial<Settings> =>
  p.bpm != null && p.bpmMin == null ? { ...p, bpmMin: p.bpm, bpmMax: p.bpm } : p
let settings: Settings = { ...DEFAULT_SETTINGS, seed: newSeed(), progSeed: newSeed(), ...migrate(loadDraft() ?? {}) }
let history: SavedPrompt[] = loadHistory()
const openGroups = new Set<string>()

const app = document.querySelector<HTMLDivElement>('#app')!
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

const chips = (key: keyof Settings, list: Option[], multi: boolean) => `
  <div class="chips" data-key="${key}" data-multi="${multi}">
    ${list.map((x) => {
      const val = settings[key]
      const on = multi ? (val as string[]).includes(x.id) : val === x.id
      return `<button type="button" class="chip${on ? ' on' : ''}" data-id="${x.id}">${esc(x.label)}</button>`
    }).join('')}
  </div>`

const select = (key: keyof Settings, values: string[]) => `
  <select data-key="${key}">${values.map((v) => `<option ${settings[key] === v ? 'selected' : ''}>${v}</option>`).join('')}</select>`

const range = (key: keyof Settings, min: number, max: number, step: number, unit = '') => `
  <div class="range"><input type="range" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${settings[key]}" />
  <output>${settings[key]}${unit}</output></div>`

const RESET_KEYS: Record<string, (keyof Settings)[]> = {
  genres: ['genres'], moods: ['moods'], instruments: ['instruments'], arrangement: ['arrangement'], vocals: ['vocals'],
  progression: ['progression'], era: ['era'], production: ['production'], tempo: ['bpmMin', 'bpmMax', 'key', 'scale'],
  custom: ['custom'], track: ['lengthSec', 'sectionCount', 'structure', 'energyCurve', 'hasIntro', 'hasOutro', 'introSeconds', 'outroSeconds', 'layers'],
}
const isDefault = (section: string) =>
  RESET_KEYS[section].every((k) => JSON.stringify(settings[k]) === JSON.stringify(DEFAULT_SETTINGS[k]))
const rnd = (n: number) => Math.floor(Math.random() * n)
const sample = <T,>(arr: T[], n: number): T[] => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]] } return a.slice(0, n) }
const one = <T,>(arr: T[]) => arr[rnd(arr.length)]
const ids = (groups: OptionGroup[]) => groups.flatMap((g) => g.options.map((o) => o.id))
const SHUFFLERS: Record<string, () => Partial<Settings>> = {
  // genres: 1–3 from at most two neighbouring groups so combinations stay plausible
  genres: () => { const g = sample(GENRE_GROUPS, 2); const pool = g.flatMap((x) => x.genres.map((o) => o.id)); return { genres: sample(pool, 1 + rnd(3)) } },
  moods: () => { const g = one(MOOD_GROUPS); return { moods: sample(g.options.map((o) => o.id), 1 + rnd(3)) } },
  instruments: () => ({ instruments: sample(ids(INSTRUMENT_GROUPS), 2 + rnd(3)) }),
  arrangement: () => ({ arrangement: one(ids(ARRANGEMENT_GROUPS)) }),
  vocals: () => ({ vocals: one(ids(VOCAL_GROUPS)) }),
  progression: () => ({ progression: one(ids(PROGRESSION_GROUPS)) }),
  era: () => ({ era: one(ERAS.map((e) => e.id)) }),
  production: () => ({ production: sample(ids(PRODUCTION_GROUPS), 1 + rnd(3)) }),
  tempo: () => { const lo = 60 + rnd(120); return { bpmMin: lo, bpmMax: lo + rnd(4) * 5, key: one(KEYS), scale: one(SCALES) } },
  track: () => ({
    lengthSec: 90 + rnd(55) * 5, sectionCount: 4 + rnd(9), structure: 'auto', energyCurve: one(['rise', 'peak-mid', 'waves', 'flat', 'fall', 'layers'] as const),
    hasIntro: Math.random() < 0.85, hasOutro: Math.random() < 0.85, introSeconds: 5 + rnd(26), outroSeconds: 5 + rnd(26), layers: [], progSeed: newSeed(),
  }),
}

const openSections = new Set<string>()
const module = (section: string, title: string, small: string, body: string) => `
  <details class="module" data-sec="${section}" ${openSections.has(section) ? 'open' : ''}>
    <summary><h2><span class="caret"></span><span>${title}</span>${small ? `<small>${small}</small>` : ''}
      ${SHUFFLERS[section] ? `<button type="button" class="reset-sec" data-shuffle="${section}" title="Randomise ${title.toLowerCase()}">shuffle</button>` : ''}
      <button type="button" class="reset-sec" data-reset="${section}" title="Reset ${title.toLowerCase()}" ${isDefault(section) ? 'disabled' : ''}>reset</button></h2></summary>
    <div class="module-body">${body}</div>
  </details>`
const labelOf = (groups: OptionGroup[], id: string) => esc(groups.flatMap((g) => g.options).find((v) => v.id === id)?.label ?? '')

const genreRack = () => `
  <div class="rack">
    ${GENRE_GROUPS.map((g) => {
      const n = g.genres.filter((x) => settings.genres.includes(x.id)).length
      const open = openGroups.has(g.id) || n > 0
      return `
      <details class="group" data-group="${g.id}" ${open ? 'open' : ''}>
        <summary><span>${esc(g.label)}</span><em>${n ? `${n} selected` : `${g.genres.length}`}</em></summary>
        ${chips('genres', g.genres, true)}
      </details>`
    }).join('')}
  </div>
  ${settings.genres.length ? `<div class="selected-genres">${settings.genres.map((id) => {
    const g = GENRE_GROUPS.flatMap((x) => x.genres).find((x) => x.id === id)
    return g ? `<button type="button" class="tag" data-remove-genre="${id}">${esc(g.label)} <i>×</i></button>` : ''
  }).join('')}</div>` : ''}`

const layerEditor = () => {
  const custom = settings.layers.length > 0
  const layers = custom ? settings.layers : autoLayers(settings).map((name) => ({ name, entry: '' }))
  const suggestions = autoLayers({ ...settings, layers: [] }).filter((n) => !layers.some((l) => l.name === n))
  return `
  <div class="layer-editor">
    <div class="layer-head"><h3>Layer order</h3><span>${custom ? 'custom' : 'suggested from your selection'}</span>
      ${custom ? '<button type="button" class="btn sm quiet" id="layersAuto">Use suggestion</button>' : ''}</div>
    <ol class="layer-list">
      ${layers.map((l, i) => `
      <li draggable="true" data-i="${i}">
        <span class="grip" title="Drag to reorder">⋮⋮</span>
        <span class="n">${i + 1}</span>
        <input class="layer-name" data-i="${i}" value="${esc(l.name)}" />
        <select class="layer-entry" data-i="${i}"><option value="">entry: default</option>${LAYER_ENTRIES.map((e) => `<option ${l.entry === e ? 'selected' : ''}>${e}</option>`).join('')}</select>
        <button type="button" class="ib" data-move="${i}:-1" title="Move up" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button type="button" class="ib" data-move="${i}:1" title="Move down" ${i === layers.length - 1 ? 'disabled' : ''}>↓</button>
        <button type="button" class="ib" data-remove-layer="${i}" title="Remove">×</button>
      </li>`).join('')}
    </ol>
    <div class="layer-add">
      <input id="newLayer" placeholder="Add a layer, e.g. tambourine" />
      <button type="button" class="btn sm" id="addLayer">Add</button>
      ${suggestions.length ? `<span class="sugg">${suggestions.slice(0, 6).map((n) => `<button type="button" class="tag" data-add-layer="${esc(n)}">+ ${esc(n)}</button>`).join('')}</span>` : ''}
    </div>
    <p class="muted small">One layer is added per section. Up to ${Math.max(2, settings.sectionCount - 1)} layers will be used.</p>
  </div>`
}

const groupedRack = (key: keyof Settings, groups: OptionGroup[], multi = true) => {
  const selected = multi ? (settings[key] as string[]) : [settings[key] as string]
  const all = groups.flatMap((g) => g.options)
  return `
  <div class="rack">
    ${groups.map((g) => {
      const n = g.options.filter((x) => selected.includes(x.id)).length
      const gid = `${key}:${g.id}`
      const open = openGroups.has(gid) || n > 0
      return `
      <details class="group" data-group="${gid}" ${open ? 'open' : ''}>
        <summary><span>${esc(g.label)}</span><em>${n ? `${n} selected` : `${g.options.length}`}</em></summary>
        ${chips(key, g.options, multi)}
      </details>`
    }).join('')}
  </div>
  ${multi && selected.length ? `<div class="selected-genres">${selected.map((id) => {
    const x = all.find((o) => o.id === id)
    return x ? `<button type="button" class="tag" data-remove="${key}:${id}">${esc(x.label)} <i>×</i></button>` : ''
  }).join('')}</div>` : ''}`
}

const timeline = (prog: string[], total: number) => {
  const segs = prog.map((line) => {
    const m = line.match(/^\[(\d+):(\d+)-(\d+):(\d+) ([^:]+):/)
    if (!m) return null
    const a = +m[1] * 60 + +m[2], b = +m[3] * 60 + +m[4]
    return { name: m[5], a, b }
  }).filter(Boolean) as { name: string; a: number; b: number }[]
  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}`
  return `<div class="tape">
    <div class="tape-ruler">${(() => { let last = -100; return [...segs.map((x) => x.a), total].map((a, i, arr) => {
      const pct = (a / total) * 100; const isLast = i === arr.length - 1
      if (!isLast && (pct - last < 7 || 100 - pct < 7)) return ''
      last = pct; return `<span style="left:${pct}%">${fmt(a)}</span>` }).join('') })()}</div>
    <div class="tape-track">${segs.map((x) => `<div class="seg seg-${x.name.replace(/[^a-z]/gi, '').toLowerCase()}" style="width:${((x.b - x.a) / total) * 100}%" title="${esc(x.name)}"><b>${esc(x.name)}</b></div>`).join('')}</div>
  </div>`
}

function render() {
  const prompt = buildPrompt(settings)
  const prog = buildProgression(settings)
  const pct = Math.min(100, (prompt.length / MAX_PROMPT) * 100)

  app.innerHTML = `
  <header class="top">
    <div class="brand"><span class="mark"></span><h1>Suno Prompt Desk</h1></div>
    <div class="top-right">
      <p>Pick a sound, shape the arrangement, copy the prompt.</p>
      <button type="button" class="btn quiet" id="resetAllBtn" title="Reset every section to its defaults">Reset everything</button>
    </div>
  </header>
  <section class="intro">
    <p>Suno Prompt Desk is a free <strong>Suno prompt generator</strong>. Combine genres from house to black metal, set mood, instruments, vocals and arrangement, and get a prompt under 1000 characters plus a <strong>timed track progression sheet</strong> you can paste straight into Suno.</p>
  </section>

  <main class="layout">
    <section class="builder">
      ${module('genres', 'Genres', settings.genres.length ? `${settings.genres.length} combined` : 'combine any number', genreRack())}
      ${module('moods', 'Mood', settings.moods.length ? `${settings.moods.length} selected` : '', groupedRack('moods', MOOD_GROUPS))}
      ${module('instruments', 'Instruments', settings.instruments.length ? `${settings.instruments.length} selected` : '', groupedRack('instruments', INSTRUMENT_GROUPS))}
      ${module('arrangement', 'Arrangement', labelOf(ARRANGEMENT_GROUPS, settings.arrangement), `
        ${groupedRack('arrangement', ARRANGEMENT_GROUPS, false)}
        ${['acapella', 'beatbox'].includes(settings.arrangement) && settings.vocals === 'none' ? '<p class="hint">Acapella and beatbox need a vocal style.</p>' : ''}
        ${['acapella', 'beatbox'].includes(settings.arrangement) && settings.instruments.length ? '<p class="hint">Instruments stay subtle, under the vocals.</p>' : ''}`)}
      ${module('vocals', 'Vocals', labelOf(VOCAL_GROUPS, settings.vocals), groupedRack('vocals', VOCAL_GROUPS, false))}
      ${module('progression', 'Progression style', labelOf(PROGRESSION_GROUPS, settings.progression), groupedRack('progression', PROGRESSION_GROUPS, false))}
      ${module('era', 'Era', esc(ERAS.find((e) => e.id === settings.era)?.label ?? ''), chips('era', ERAS, false))}
      ${module('production', 'Production', settings.production.length ? `${settings.production.length} selected` : '', groupedRack('production', PRODUCTION_GROUPS))}
      ${module('tempo', 'Tempo &amp; key', `${Math.min(settings.bpmMin, settings.bpmMax)}–${Math.max(settings.bpmMin, settings.bpmMax)} bpm${settings.key !== 'Any' ? ` · ${settings.key} ${settings.scale}` : ''}`, `
        <div class="grid4">
          <label>BPM from ${range('bpmMin', 40, 220, 1)}</label>
          <label>BPM to ${range('bpmMax', 40, 220, 1)}</label>
          <label>Key ${select('key', KEYS)}</label>
          <label>Scale ${select('scale', SCALES)}</label>
        </div>`)}
      ${module('custom', 'Extra details', settings.custom.trim() ? `${settings.custom.trim().length} chars` : '', `
        <textarea data-key="custom" rows="2" placeholder="e.g. sunset drive, lyrics about letting go, whistle hook…">${esc(settings.custom)}</textarea>`)}
      ${module('track', 'Track progression', `${Math.floor(settings.lengthSec / 60)}:${String(settings.lengthSec % 60).padStart(2, '0')} · ${settings.sectionCount} sections · ${settings.energyCurve}`, `
        <div class="grid3">
          <label>Length ${range('lengthSec', 30, MAX_LENGTH, 5, 's')}</label>
          <label>Sections ${range('sectionCount', 3, 16, 1)}</label>
          <label>Structure ${select('structure', ['auto', 'edm', 'trance', 'techno', 'bass', 'hard', 'song', 'hiphop', 'rock', 'metal', 'jazz', 'folk', 'world', 'ambient', 'instrumental'])}</label>
          <label>Energy ${select('energyCurve', ['rise', 'peak-mid', 'waves', 'flat', 'fall', 'layers'])}</label>
          <label><span class="toggle"><input type="checkbox" data-key="hasIntro" ${settings.hasIntro ? 'checked' : ''} /> Intro</span>${settings.hasIntro ? range('introSeconds', 0, 60, 1, 's') : '<span class="off">off</span>'}</label>
          <label><span class="toggle"><input type="checkbox" data-key="hasOutro" ${settings.hasOutro ? 'checked' : ''} /> Outro</span>${settings.hasOutro ? range('outroSeconds', 0, 60, 1, 's') : '<span class="off">off</span>'}</label>
        </div>
        <div class="curve">${curveSvg(settings)}</div>
        ${settings.energyCurve === 'layers' ? layerEditor() : ''}`)}
    </section>

    <aside class="sheet">
      <div class="sticky">
        <div class="sheet-head">
          <h2>Prompt</h2>
          <span class="count ${prompt.length > MAX_PROMPT ? 'warn' : ''}">${prompt.length}<i>/${MAX_PROMPT}</i></span>
        </div>
        <div class="meter"><i style="width:${pct}%"></i></div>
        <pre class="prompt" id="promptOut">${esc(prompt) || '<span class="muted">Pick a genre or two to start.</span>'}</pre>
        <div class="actions">
          <button class="btn" data-copy="prompt">Copy prompt</button>
          <button class="btn" id="shuffleBtn" title="Re-roll the prompt wording">Shuffle prompt</button>
        </div>

        <div class="sheet-head"><h2>Progression sheet</h2><span class="count">${prog.length}<i> sections</i></span></div>
        ${timeline(prog, Math.max(30, settings.lengthSec))}
        <pre class="prog" id="sheetOut">${prog.map(esc).join('\n')}</pre>
        <div class="actions">
          <button class="btn" data-copy="sheet">Copy sheet</button>
          <button class="btn" data-copy="both">Copy both</button>
          <button class="btn" id="shuffleSheetBtn" title="Re-roll the section layout and descriptions">Shuffle sheet</button>
        </div>

        <div class="save">
          <input id="title" placeholder="Name this prompt" />
          <button class="btn primary" id="saveBtn" ${prompt ? '' : 'disabled'}>Save</button>
          <button class="btn quiet" id="resetBtn" title="Reset every section to its defaults">Reset all</button>
        </div>
        <p class="status" id="status"></p>
      </div>
    </aside>
  </main>

  <section class="history">
    <h2>Saved prompts <small>${history.length}</small></h2>
    ${history.length ? `<ul>${history.map((h) => `
      <li>
        <div class="hmeta"><strong>${esc(h.title || 'Untitled')}</strong><span>${new Date(h.createdAt).toLocaleString()}</span></div>
        <p>${esc(h.prompt)}</p>
        <div class="actions">
          <button class="btn sm" data-load="${h.id}">Load</button>
          <button class="btn sm" data-hcopy="${h.id}">Copy</button>
          <button class="btn sm danger" data-del="${h.id}">Delete</button>
        </div>
      </li>`).join('')}</ul>` : '<p class="muted">Saved prompts show up here. Save one from the sheet on the right.</p>'}
  </section>

  <footer class="foot">
    <span>Suno Prompt Desk · an independent tool, not affiliated with Suno</span>
    <nav><a href="/imprint.html">Imprint &amp; privacy</a><a href="#" data-consent-settings>Analytics settings</a></nav>
  </footer>`

  bind()
}

function curveSvg(s: Settings) {
  const prog = buildProgression(s)
  const n = prog.length
  const pts = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40
    const e = ({
      rise: 0.2 + 0.8 * t, fall: 1 - 0.8 * t, 'peak-mid': 0.25 + 0.75 * Math.sin(Math.PI * t),
      waves: 0.35 + 0.65 * Math.abs(Math.sin(Math.PI * 2.5 * t)), flat: 0.6, layers: 0.15 + 0.85 * t,
    } as Record<string, number>)[s.energyCurve]
    return `${(t * 400).toFixed(1)},${(60 - e * 55).toFixed(1)}`
  })
  return `<svg viewBox="0 0 400 64" preserveAspectRatio="none">

    ${Array.from({ length: n - 1 }, (_, i) => `<line x1="${((i + 1) * 400) / n}" y1="0" x2="${((i + 1) * 400) / n}" y2="64" stroke="var(--line)"/>`).join('')}
    <polyline points="${pts.join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`
}

function setStatus(msg: string, ok = true) {
  const el = document.getElementById('status')
  if (el) { el.textContent = msg; el.className = `status ${ok ? 'ok' : 'err'}` }
}

function update(patch: Partial<Settings>) {
  settings = { ...settings, ...patch }
  saveDraft(settings)
  render()
}

function currentLayers() {
  return settings.layers.length ? settings.layers : autoLayers(settings).map((name) => ({ name, entry: '' }))
}

function bind() {
  app.querySelectorAll<HTMLDetailsElement>('details.module').forEach((d) =>
    d.addEventListener('toggle', () => { d.open ? openSections.add(d.dataset.sec!) : openSections.delete(d.dataset.sec!) }))
  app.querySelectorAll<HTMLButtonElement>('.reset-sec').forEach((b) => b.addEventListener('click', (e) => e.stopPropagation()))
  app.querySelectorAll<HTMLButtonElement>('[data-shuffle]').forEach((b) => b.addEventListener('click', () => update(SHUFFLERS[b.dataset.shuffle!]())))
  // layer editor
  app.querySelector('#layersAuto')?.addEventListener('click', () => update({ layers: [] }))
  app.querySelectorAll<HTMLButtonElement>('[data-move]').forEach((b) => b.addEventListener('click', () => {
    const [i, d] = b.dataset.move!.split(':').map(Number)
    const l = [...currentLayers()]; const j = i + d
    if (j < 0 || j >= l.length) return
    ;[l[i], l[j]] = [l[j], l[i]]
    update({ layers: l })
  }))
  app.querySelectorAll<HTMLButtonElement>('[data-remove-layer]').forEach((b) => b.addEventListener('click', () => {
    const l = currentLayers().filter((_, i) => i !== Number(b.dataset.removeLayer))
    update({ layers: l.length ? l : [{ name: 'drums', entry: '' }] })
  }))
  app.querySelectorAll<HTMLInputElement>('.layer-name').forEach((inp) => inp.addEventListener('change', () => {
    const l = currentLayers().map((x, i) => (i === Number(inp.dataset.i) ? { ...x, name: inp.value.trim() || x.name } : x))
    update({ layers: l })
  }))
  app.querySelectorAll<HTMLSelectElement>('.layer-entry').forEach((sel) => sel.addEventListener('change', () => {
    const l = currentLayers().map((x, i) => (i === Number(sel.dataset.i) ? { ...x, entry: sel.value } : x))
    update({ layers: l })
  }))
  // drag and drop reordering
  let dragFrom = -1
  app.querySelectorAll<HTMLLIElement>('.layer-list li').forEach((li) => {
    li.addEventListener('dragstart', (e) => {
      dragFrom = Number(li.dataset.i); li.classList.add('dragging')
      e.dataTransfer?.setData('text/plain', String(dragFrom)); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
    })
    li.addEventListener('dragend', () => { li.classList.remove('dragging'); app.querySelectorAll('.layer-list li').forEach((x) => x.classList.remove('over-top', 'over-bottom')) })
    li.addEventListener('dragover', (e) => {
      e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
      const r = li.getBoundingClientRect(); const below = e.clientY > r.top + r.height / 2
      li.classList.toggle('over-top', !below); li.classList.toggle('over-bottom', below)
    })
    li.addEventListener('dragleave', () => li.classList.remove('over-top', 'over-bottom'))
    li.addEventListener('drop', (e) => {
      e.preventDefault()
      const to0 = Number(li.dataset.i); const r = li.getBoundingClientRect(); const below = e.clientY > r.top + r.height / 2
      if (dragFrom < 0 || dragFrom === to0) return
      const l = [...currentLayers()]; const [item] = l.splice(dragFrom, 1)
      let to = to0 + (below ? 1 : 0); if (dragFrom < to) to--
      l.splice(to, 0, item); update({ layers: l })
    })
  })
  // prevent drag starting from the text input (so text selection still works)
  app.querySelectorAll<HTMLInputElement>('.layer-name').forEach((inp) => {
    inp.addEventListener('mousedown', () => { inp.closest('li')!.draggable = false })
    inp.addEventListener('blur', () => { inp.closest('li')!.draggable = true })
  })
  const addLayer = (name: string) => { if (name.trim()) update({ layers: [...currentLayers(), { name: name.trim(), entry: '' }] }) }
  app.querySelector('#addLayer')?.addEventListener('click', () => addLayer((document.getElementById('newLayer') as HTMLInputElement).value))
  app.querySelector<HTMLInputElement>('#newLayer')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') addLayer((e.target as HTMLInputElement).value) })
  app.querySelectorAll<HTMLButtonElement>('[data-add-layer]').forEach((b) => b.addEventListener('click', () => addLayer(b.dataset.addLayer!)))

  app.querySelectorAll<HTMLDetailsElement>('details.group').forEach((d) =>
    d.addEventListener('toggle', () => { d.open ? openGroups.add(d.dataset.group!) : openGroups.delete(d.dataset.group!) }))
  app.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((b) => b.addEventListener('click', () => {
    const [key, id] = b.dataset.remove!.split(':') as [keyof Settings, string]
    update({ [key]: (settings[key] as string[]).filter((x) => x !== id) } as Partial<Settings>)
  }))
  app.querySelectorAll<HTMLButtonElement>('[data-remove-genre]').forEach((b) =>
    b.addEventListener('click', () => update({ genres: settings.genres.filter((g) => g !== b.dataset.removeGenre) })))
  app.querySelectorAll<HTMLElement>('.chips').forEach((group) => {
    const key = group.dataset.key as keyof Settings
    const multi = group.dataset.multi === 'true'
    group.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.chip')
      if (!btn) return
      const id = btn.dataset.id!
      if (multi) {
        const cur = settings[key] as string[]
        update({ [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } as Partial<Settings>)
      } else update({ [key]: id } as Partial<Settings>)
    })
  })
  app.querySelectorAll<HTMLInputElement>('input[type=range]').forEach((inp) => {
    inp.addEventListener('input', () => {
      const out = inp.nextElementSibling as HTMLOutputElement
      out.textContent = inp.value + (out.textContent?.replace(/[\d.-]+/, '') ?? '')
    })
    inp.addEventListener('change', () => {
      const key = inp.dataset.key as keyof Settings, v = Number(inp.value)
      const patch: Partial<Settings> = { [key]: v } as Partial<Settings>
      if (key === 'bpmMin' && v > settings.bpmMax) patch.bpmMax = v
      if (key === 'bpmMax' && v < settings.bpmMin) patch.bpmMin = v
      update(patch)
    })
  })
  app.querySelectorAll<HTMLInputElement>('input[type=checkbox][data-key]').forEach((cb) =>
    cb.addEventListener('change', () => update({ [cb.dataset.key!]: cb.checked } as Partial<Settings>)))
  app.querySelectorAll<HTMLSelectElement>('select').forEach((sel) =>
    sel.addEventListener('change', () => update({ [sel.dataset.key!]: sel.value } as Partial<Settings>)))
  const ta = app.querySelector<HTMLTextAreaElement>('textarea')!
  ta.addEventListener('change', () => update({ custom: ta.value }))

  app.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) =>
    b.addEventListener('click', async () => {
      const p = document.getElementById('promptOut')!.textContent ?? ''
      const s = document.getElementById('sheetOut')!.textContent ?? ''
      const map = { prompt: p, sheet: s, both: `${p}\n\n${s}` }
      await navigator.clipboard.writeText(map[b.dataset.copy as keyof typeof map])
      setStatus('Copied to clipboard')
      trackEvent('Copy', { what: b.dataset.copy! })
    }))

  document.getElementById('shuffleBtn')!.addEventListener('click', () => update({ seed: newSeed() }))
  document.getElementById('shuffleSheetBtn')!.addEventListener('click', () => update({ progSeed: newSeed() }))
  const resetAll = () => { update({ ...DEFAULT_SETTINGS, seed: newSeed(), progSeed: newSeed() }); setStatus('Everything reset') }
  document.getElementById('resetBtn')!.addEventListener('click', resetAll)
  document.getElementById('resetAllBtn')!.addEventListener('click', resetAll)
  app.querySelectorAll<HTMLButtonElement>('[data-reset]').forEach((b) => b.addEventListener('click', () => {
    const patch: Partial<Settings> = {}
    for (const k of RESET_KEYS[b.dataset.reset!]) (patch as Record<string, unknown>)[k] = DEFAULT_SETTINGS[k]
    update(patch)
  }))

  document.getElementById('saveBtn')!.addEventListener('click', async () => {
    const item: SavedPrompt = {
      id: `local-${Date.now()}`, userId,
      title: (document.getElementById('title') as HTMLInputElement).value.trim(),
      createdAt: new Date().toISOString(),
      prompt: buildPrompt(settings), progression: buildProgression(settings), settings,
    }
    const synced = await savePromptToServer(item)
    history = [synced ?? item, ...history]
    saveHistory(history)
    render()
    setStatus('Prompt saved')
    trackEvent('Save prompt', { genres: settings.genres.length, arrangement: settings.arrangement })
  })

  app.querySelectorAll<HTMLButtonElement>('[data-load]').forEach((b) =>
    b.addEventListener('click', () => {
      const h = history.find((x) => x.id === b.dataset.load)
      if (h) { update({ ...DEFAULT_SETTINGS, ...migrate(h.settings) }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    }))
  app.querySelectorAll<HTMLButtonElement>('[data-hcopy]').forEach((b) =>
    b.addEventListener('click', async () => {
      const h = history.find((x) => x.id === b.dataset.hcopy)
      if (h) { await navigator.clipboard.writeText(`${h.prompt}\n\n${h.progression.join('\n')}`); setStatus('Copied') }
    }))
  app.querySelectorAll<HTMLButtonElement>('[data-del]').forEach((b) =>
    b.addEventListener('click', async () => {
      history = history.filter((x) => x.id !== b.dataset.del)
      saveHistory(history)
      render()
    }))
}

render()
initConsent()
