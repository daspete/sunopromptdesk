import {
  ARRANGEMENTS, ERAS, GENRES, INSTRUMENTS, genreGroupOf, MOODS, PRODUCTION, PROGRESSION_STYLES, SECTION_TYPES, VOCALS, type Option,
} from '../shared/data.ts'
import { DEFAULT_SETTINGS, LAYER_ENTRIES, MAX_LENGTH, MAX_PROMPT, PROMPT_SECTIONS, type Layer, type SectionOverride, type Settings } from '../shared/settings.ts'



// Small deterministic PRNG (mulberry32) so the same seed reproduces the same result
function rng(seed: number) {
  let a = (seed >>> 0) || 1
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = <T,>(r: () => number, arr: T[]): T => arr[Math.floor(r() * arr.length)]

const tags = (list: Option[], ids: string[]) =>
  ids.map((id) => list.find((x) => x.id === id)?.tag).filter(Boolean) as string[]

type Tiered = { key: string; s: string; m: string; l: string; x?: string }

const listOf = (arr: string[]) => (arr.length > 1 ? `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}` : arr[0] ?? '')

function promptParts(s: Settings, r: () => number): Tiered[] {
  const parts: Tiered[] = []
  const P = (key: string, short: string, medium: string, long: string, xl?: string) => parts.push({ key, s: short, m: medium, l: long, x: xl })
  // optional descriptive add-ons: empty at short/medium, only appear when there is room
  const X = (long: string, xl: string) => parts.push({ key: 'extras', s: '', m: '', l: long, x: xl })

  // genres
  if (s.genres.length) {
    const g = tags(GENRES, s.genres)
    if (g.length === 1) {
      P('genres', g[0],
        pick(r, [`${g[0]} track`, `pure ${g[0]}`, `${g[0]} production`]),
        pick(r, [`an authentic ${g[0]} track that stays true to the genre's signature sound`, `${g[0]}, true to the style with its classic rhythmic and harmonic language`, `a ${g[0]} production that captures everything the genre is known for`]),
        pick(r, [`an authentic ${g[0]} track that stays true to the genre's signature sound: the typical rhythm patterns, the characteristic instrument tones and the kind of arrangement a seasoned ${g[0]} producer would write`, `a ${g[0]} production that captures everything the genre is known for, from its trademark groove and chord voicings to the sonic details that make it instantly recognisable to fans of the style`]))
    } else {
      const joiner = pick(r, [' fused with ', ' blended with ', ' meets ', ' crossed with ', ' infused with '])
      P('genres', g.join(' + '),
        pick(r, [g.join(joiner), `a blend of ${listOf(g)}`, `${g[0]} with ${listOf(g.slice(1))} influences`]),
        pick(r, [`a hybrid of ${listOf(g)}, where ${g[0]} sets the foundation and ${listOf(g.slice(1))} colour the arrangement`, `${g[0]} at its core, ${joiner.trim()} ${listOf(g.slice(1))} so both worlds stay recognisable throughout`, `${listOf(g)} woven together, shifting emphasis between the styles from section to section`]),
        pick(r, [`a genuine hybrid of ${listOf(g)}: ${g[0]} provides the rhythmic foundation and overall structure, while ${listOf(g.slice(1))} shape the melodic content, the textures and the sound palette, so that both worlds stay clearly recognisable and neither one feels like a gimmick`, `${listOf(g)} woven together into one coherent sound, shifting emphasis between the styles from section to section, borrowing the groove from one and the harmonic and timbral identity from the other`]))
    }
  }

  // mood
  if (s.moods.length) {
    const m = tags(MOODS, s.moods)
    P('moods', m.join(', '),
      pick(r, [`${m.join(', ')} mood`, `${m.join(', ')} atmosphere`, `${listOf(m)} feel`, `${m.join(', ')} vibe`]),
      pick(r, [`an overall ${listOf(m)} mood that carries through every section`, `the atmosphere is ${listOf(m)}, felt in the melodies, the chord choices and the sound design`, `emotionally ${listOf(m)}, with the energy of the arrangement serving that feeling first`]),
      pick(r, [`an overall ${listOf(m)} mood that carries through every section, expressed in the melodic phrasing, the chord choices, the sound design and the way the dynamics rise and fall, so the emotional tone is unmistakable from the first seconds`, `the atmosphere is ${listOf(m)}, felt in the melodies, the harmony and the textures, and the arrangement is paced so that this feeling deepens as the track develops rather than staying static`]))
  }

  // instruments
  if (s.instruments.length) {
    const i = tags(INSTRUMENTS, s.instruments)
    const vocalLed = ['acapella', 'beatbox'].includes(s.arrangement)
    if (vocalLed) {
      P('instruments', `subtle ${i.join(', ')}`,
        pick(r, [`subtle touches of ${i.join(', ')} far in the background`, `with only faint, sparse ${listOf(i)} accents`, `minimal ${i.join(', ')} textures under the voices`]),
        pick(r, [`${listOf(i)} used very sparingly and mixed far behind the voices, adding colour without ever competing with the vocal arrangement`, `only the faintest hints of ${listOf(i)}, tucked under the vocal layers so the voices stay the whole focus`]))
    } else {
      P('instruments', i.join(', '),
        pick(r, [`featuring ${i.join(', ')}`, `with ${i.join(', ')}`, `built around ${listOf(i)}`, `${listOf(i)} lead the arrangement`]),
        pick(r, [`built around ${listOf(i)}, each given its own space in the mix and its own moment to lead`, `featuring ${listOf(i)}, with ${i[0]} carrying the main hook while the rest support and answer it`, `instrumentation centred on ${listOf(i)}, arranged so they interlock rather than crowd each other`]),
        pick(r, [`built around ${listOf(i)}, each given its own register and its own space in the stereo field, with ${i[0]} carrying the main hook and the other elements answering, doubling or supporting it depending on the section`, `featuring ${listOf(i)}, arranged so they interlock rather than crowd each other: ${i[0]} leads the melodic content while the rest provide rhythm, harmony and texture, and each instrument gets at least one moment where it steps into the foreground`]))
    }
  }

  // arrangement
  const arr = ARRANGEMENTS.find((x) => x.id === s.arrangement)
  if (arr?.tag) {
    const longArr: Record<string, string[]> = {
      acapella: ['entirely vocal: the melody, the harmony, the bass and the rhythm are all sung, with stacked harmonies filling the role of the band', 'acapella arrangement where layered voices carry every part, from hummed basslines to percussive vocal rhythms'],
      beatbox: ['beatbox acapella: kick, snare and hi-hats performed by mouth, a sung bassline underneath and harmonies stacked on top', 'everything comes from voices, beatboxed drums and lip bass driving the groove while harmonies carry the chords'],
      unplugged: ['an unplugged acoustic arrangement, intimate and organic, with room sound and natural dynamics instead of electronic elements', 'stripped to acoustic instruments recorded live in a room, warm and close, no programmed elements'],
      stripped: ['a stripped-back arrangement with lots of space, only the essential elements, every note carrying weight', 'deliberately minimal: few elements, wide space between them, intimate and direct'],
      live: ['recorded as a live session with a real band in a room, slight imperfections, audible interplay and energy', 'live session feel with musicians playing together, natural dynamics and room ambience'],
      orchestralArr: ['a full orchestral arrangement with strings, brass, woodwinds and percussion, cinematic in scale and dynamics', 'scored for full orchestra, sweeping string lines, brass swells and timpani driving the climaxes'],
      pianovocal: ['piano and voice only, intimate and exposed, the piano covering bass, harmony and rhythm while the voice carries the melody', 'a piano-and-voice arrangement with nothing else, close-miked and honest, dynamics carried entirely by the performance'],
      guitarvocal: ['a single guitar and one voice, fingerpicked or strummed, nothing added, the kind of arrangement that works on a porch or a small stage', 'solo guitar and voice only, every chord change and breath audible'],
      band: ['a tight small band of drums, bass, guitar and keys playing together, no overdubs beyond what four players could perform', 'a classic small-band lineup: drums, bass, guitar and keys, arranged with space so each player is heard'],
      bigband: ['a big band arrangement with full trumpet, trombone and sax sections trading riffs over a swinging rhythm section', 'big band: stacked horn sections, punchy ensemble hits, a walking bass and a drummer driving the swing'],
      quartet: ['arranged for string quartet, two violins, viola and cello covering melody, harmony and rhythm between them', 'a string quartet arrangement, intimate and precise, with pizzicato and bowed textures sharing the roles of a band'],
      electronicArr: ['fully electronic: synthesizers, drum machines and samples only, no acoustic instruments, programmed rather than performed', 'an all-electronic arrangement built from synths and drum machines, with sound design taking the place of live players'],
      lofiArr: ['a lo-fi bedroom production, hazy and intimate, slightly detuned, with tape hiss, soft drums and a warm, unhurried feel', 'lo-fi bedroom arrangement recorded small and close, imperfect on purpose, warm and nostalgic'],
      clubedit: ['an extended club edit with a long DJ-friendly intro and outro on drums and bass, the main hooks held back until the track is fully in', 'a club edit structured for mixing: beat-only intro, gradual build, full hooks in the middle, beat-only outro'],
      remix: ['a remix-style rework that keeps the original vocal and hooks but replaces the beat, bass and harmony with a new production underneath', 'remix arrangement: the recognisable hooks on top of an entirely new groove, re-pitched and re-timed to the new feel'],
      choirArr: ['choir and organ, hymn-like and spacious, the organ carrying the harmony and the choir carrying the melody in four parts', 'a choir-and-organ arrangement in a large reverberant space, slow and stately'],
      chamber: ['a small chamber ensemble of strings, a woodwind or two and piano, delicate and transparent, written rather than jammed', 'chamber arrangement for a handful of acoustic players, every line deliberate, intimate dynamics'],
      marching: ['a marching band arrangement with a driving drumline, snare rolls, bass drums, and brass carrying the melody in unison and harmony', 'marching band: drumline cadences, brass fanfares and ensemble hits with outdoor energy'],
      solo: ['a single solo instrument, completely unaccompanied, the melody, harmony and rhythm all implied by one performer', 'one instrument alone, exposed and expressive, with silence as part of the arrangement'],
      duo: ['a duo of two instruments in dialogue, trading melody and accompaniment, nothing else added', 'two instruments only, one leading and one answering, the roles swapping between sections'],
      hybrid: ['a hybrid of live instruments and electronic production, real drums and guitars sitting alongside synths and programmed elements', 'live playing and electronic production blended, organic performances over a programmed backbone'],
      wallofsound: ['a dense wall-of-sound arrangement with everything layered and doubled, huge and enveloping', 'wall of sound: massed instruments, doubled vocals and reverb filling every frequency'],
      gospel: ['a gospel choir backed by piano, organ, bass and drums, building from a single voice to a full congregation', 'gospel arrangement with choir call-and-response, Hammond organ and a driving rhythm section'],
      vocalgroup: ['a vocal harmony group with light backing, the voices carrying the melody and the harmony in tight arrangements', 'vocal group arrangement, three to five voices in close harmony over minimal instrumentation'],
      trio: ['a three-piece acoustic trio playing together, each instrument carrying a clear role', 'an acoustic trio arrangement, intimate and balanced'],
      campfire: ['a campfire sing-along with one acoustic guitar and a group of friends singing, loose and warm', 'campfire arrangement, strummed guitar and everyone joining in on the chorus'],
      folkensemble: ['a folk ensemble with fiddle, mandolin, guitar and upright bass trading melodies', 'folk ensemble arrangement, acoustic instruments weaving around the vocal'],
      pianoconcerto: ['piano with orchestral accompaniment, the piano leading and the orchestra answering and swelling behind it', 'a piano-and-orchestra arrangement in the concerto tradition, virtuosic piano against lush strings'],
      epicorchestral: ['epic trailer-style orchestra with choir, massive percussion and brass, built for maximum scale', 'epic orchestral arrangement with choir and hybrid percussion, huge dynamics and cinematic impact'],
      brassband: ['a brass band arrangement, cornets, horns, euphoniums and tubas in rich harmony', 'brass band: warm blended brass with percussion, hymn-like and stately'],
      windensemble: ['a wind ensemble of woodwinds and brass, colourful and precise', 'wind ensemble arrangement with clarinets, flutes, saxes and brass sharing the themes'],
      jazztrio: ['a jazz trio of piano, upright bass and drums, conversational and swinging', 'jazz trio arrangement with space for each player to solo'],
      jazzcombo: ['a jazz combo with horns and rhythm section, head arrangements and solos', 'jazz combo: trumpet, sax, piano, bass and drums trading choruses'],
      soulband: ['a soul band with horn section, keys, guitar and backing vocals, tight and warm', 'soul band arrangement with punchy horn lines and gospel-tinged backing vocals'],
      lounge: ['a lounge arrangement, smooth and understated, soft keys, brushed drums and a relaxed bass', 'lounge: easy-listening arrangement with vibraphone, soft guitar and a gentle groove'],
      funkband: ['a tight funk band with horn stabs, clavinet, slap bass and a locked-in drummer', 'funk band arrangement, syncopated guitar, horn punches and a deep pocket'],
      radioedit: ['a tight radio edit that gets to the hook fast, short intro, no long instrumental passages', 'radio edit arrangement, concise and hook-forward'],
      dubversion: ['a dub version with the vocals stripped to fragments, drums and bass upfront, echo and delay throws everywhere', 'dub arrangement: heavy bass, spacious drums, dropped-out sections and tape delay on everything'],
      modularjam: ['a modular synth jam, evolving patches, hands-on tweaks and slowly mutating sequences', 'modular jam arrangement, generative sequences and live filter and envelope changes'],
      liveelectronic: ['a live electronic set feel, hardware drum machines and synths played in real time with fills and mutes', 'live electronic performance with hands-on transitions and improvised variations'],
      latinband: ['a latin band with full percussion section, horns and piano montuno, driving and danceable', 'latin band arrangement: congas, timbales, bongos, brass and a tumbao bass'],
      afroensemble: ['an afrobeat ensemble with layered percussion, interlocking guitars, horns and call-and-response vocals', 'afro ensemble arrangement, polyrhythmic and hypnotic, long grooves'],
      reggaeband: ['a reggae band with skank guitar, organ bubble, deep bass and one-drop drums', 'reggae band arrangement, heavy bass and offbeat chops with horn lines'],
      mariachiArr: ['a mariachi ensemble with trumpets, violins, vihuela and guitarrón', 'mariachi arrangement, passionate trumpets and strummed rhythm'],
      celticArr: ['a celtic session with fiddle, tin whistle, bodhrán and guitar, lively and melodic', 'celtic arrangement with reels and airs, fiddle leading'],
      indianensemble: ['an indian classical ensemble with sitar, tabla and tanpura drone', 'indian ensemble arrangement, raga-based melodies over tabla rhythms'],
      flamencoArr: ['flamenco guitar with palmas, cajón and passionate vocal', 'flamenco arrangement, rasgueado guitar, handclaps and footwork'],
      gamelan: ['a gamelan ensemble of tuned metallophones, gongs and drums, interlocking patterns', 'gamelan arrangement, shimmering metallic textures in layered cycles'],
      ambientArr: ['a beatless ambient soundscape of slowly evolving pads, drones and textures, no drums, time suspended', 'ambient arrangement with no rhythm section at all, long swells and layered drones that change almost imperceptibly'],
    }
    P('arrangement', arr.tag.split(',')[0], arr.tag, pick(r, longArr[s.arrangement] ?? [arr.tag]))
  }

  // vocals
  const v = VOCALS.find((x) => x.id === s.vocals)
  if (v && !(['acapella', 'beatbox'].includes(s.arrangement) && s.vocals === 'none')) {
    const isInst = s.vocals === 'none'
    P('vocals', v.tag.split(',')[0], v.tag,
      isInst
        ? pick(r, ['fully instrumental, no vocals at all, the melodies carried by the instruments instead', 'instrumental throughout, with lead instruments taking the role a vocal would normally have'])
        : pick(r, [`${v.tag}, expressive and upfront in the mix, carrying the hook and the emotional arc of the song`, `${v.tag} as the focal point, phrased naturally with harmonies and ad-libs where the arrangement opens up`, `${v.tag}, clear and present, with the delivery adapting to the energy of each section`]),
      isInst
        ? 'fully instrumental with no vocals at all, the lead melodies carried by the instruments, written with strong, singable hooks so nothing feels like a missing vocal'
        : pick(r, [`${v.tag}, expressive and upfront in the mix, carrying the hook and the emotional arc of the song, intimate and restrained in the quieter sections and opening up with harmonies, doubles and ad-libs when the arrangement peaks`, `${v.tag} as the focal point, phrased naturally and conversationally, with the delivery adapting to the energy of each section and layered harmonies reserved for the choruses`]))
  }

  // progression style
  const ps = PROGRESSION_STYLES.find((x) => x.id === s.progression)
  if (ps) {
    P('progression', ps.label.toLowerCase(), pick(r, [`arrangement: ${ps.tag}`, `structure: ${ps.tag}`, ps.tag]),
      pick(r, [`the arrangement follows a ${ps.tag}, with clear transitions so every section has a distinct role`, `structured as a ${ps.tag}, pacing the energy deliberately from the first bar to the last`]),
      pick(r, [`the arrangement follows a ${ps.tag}, with clear, musical transitions between sections so every part has a distinct role, nothing overstays its welcome and the listener always senses where the track is heading`, `structured as a ${ps.tag}, pacing the energy deliberately from the first bar to the last, using fills, risers, drops and silence to mark the transitions`]))
  }

  // era
  if (s.era !== 'none') {
    const e = ERAS.find((x) => x.id === s.era)
    if (e) P('era', e.label, e.tag, pick(r, [`${e.tag} in sound and production, from the instrument choices to the mix aesthetics`, `rooted in a ${e.tag} sound, with period-accurate tones and processing`]))
  }

  // production
  if (s.production.length) {
    const pr = tags(PRODUCTION, s.production)
    P('production', pr.join(', '), pick(r, [pr.join(', '), `production: ${pr.join(', ')}`]),
      pick(r, [`production with ${listOf(pr)}, mixed so each element sits clearly in its own space`, `sonically ${listOf(pr)}, a polished but characterful mix with a strong sense of depth`, `the mix is ${listOf(pr)}, balanced for both headphones and big systems`]),
      pick(r, [`production with ${listOf(pr)}, mixed so each element sits clearly in its own space, with a deep, controlled low end, a present midrange and an airy top, balanced for both headphones and big sound systems`, `sonically ${listOf(pr)}, a polished but characterful mix with a strong sense of depth and width, careful dynamics and enough headroom that the loud moments actually hit`]))
  }

  // descriptive add-ons (only used when there is room)
  const lead = s.instruments[0] ? tags(INSTRUMENTS, [s.instruments[0]])[0] : 'the lead'
  X(pick(r, ['a strong, memorable main hook that returns in every chorus', 'a clear central motif that is introduced early and developed throughout']),
    pick(r, [`a strong, memorable main hook introduced early by ${lead} and returning in every chorus with added layers and harmonies so it feels bigger each time`, 'a clear central motif introduced in the first section and developed throughout, transposed, re-harmonised and re-orchestrated so it stays fresh while remaining recognisable']))
  X(pick(r, ['detailed sound design with evolving textures', 'rich layered sound design']),
    pick(r, ['detailed sound design with evolving textures, subtle modulation, filtered transitions and small ear-candy details that reward repeated listening', 'rich layered sound design where pads and textures slowly move underneath the main elements, with tasteful effects, delays and reverbs placing everything in a believable space']))
  X(pick(r, ['dynamic arrangement with real contrast between quiet and loud', 'clear dynamics between sections']),
    pick(r, ['a dynamic arrangement with real contrast between the quiet and the loud moments, stripping elements away before the big sections so the peaks land with full impact', 'clear dynamic shaping between sections, using breakdowns and silence to build anticipation and dense, full-range moments to release it']))
  X(pick(r, ['smooth, musical transitions between sections', 'transitions driven by fills, risers and filter sweeps']),
    pick(r, ['smooth, musical transitions between sections using drum fills, risers, reverse swells and filter sweeps so every change feels prepared rather than abrupt', 'each transition is marked by a fill, a riser or a brief drop-out, keeping the flow natural while making the structure easy to follow']))
  X(pick(r, ['a satisfying, intentional ending', 'an ending that resolves cleanly']),
    pick(r, ['a satisfying, intentional ending rather than a plain fade, resolving the main theme one last time before the final hit or decay', 'an ending that resolves cleanly, bringing the main motif back in a reduced form and letting the last chord ring out naturally']))
  X(pick(r, ['high-quality, professional production', 'radio-ready professional quality']),
    pick(r, ['high-quality, professional, release-ready production with a clean, well-balanced master, no clipping or harshness, and a consistent sonic character from start to finish', 'radio-ready professional quality throughout, coherent in tone, carefully mixed and mastered with clarity, punch and depth']))

  // tempo
  const lo = Math.min(s.bpmMin, s.bpmMax), hi = Math.max(s.bpmMin, s.bpmMax)
  const bpm = lo === hi ? `${lo} bpm` : `${lo}-${hi} bpm`
  P('tempo', bpm, bpm, pick(r, [`tempo around ${bpm}, locked and steady`, `${bpm}, a tempo that keeps the groove ${hi < 100 ? 'relaxed' : hi < 130 ? 'moving' : 'driving'}`]))

  // key
  if (s.key !== 'Any') {
    const k = `${s.key} ${s.scale}`
    P('key', `${k}`, `key of ${k}`, pick(r, [`in the key of ${k}, with melodies and harmony built from that scale`, `written in ${k}, the harmony staying close to the scale with occasional colour notes`]))
  }

  // custom text (always verbatim)
  if (s.custom.trim()) { const c = s.custom.trim(); P('custom', c, c, c) }

  return parts
}

export function buildPrompt(s: Settings): string {
  const r = rng(s.seed * 7 + 3)
  const parts = promptParts(s, r)
  if (!parts.length) return ''
  const join = (tiers: (keyof Tiered)[]) => parts.map((p, i) => p[tiers[i]] ?? p.l).filter(Boolean).join(', ')

  // upgrade order: heavier sections first (per-section weight, 1 for anything unset),
  // ties broken by the default section order, then tempo/key/custom at the end
  const listed = PROMPT_SECTIONS.map((x) => x.id)
  const weight = (key: string) => s.promptWeights[key] ?? 1
  const rank = (key: string) => { const i = listed.indexOf(key); return i < 0 ? listed.length : i }
  const order = parts.map((_, i) => i).sort((a, b) =>
    weight(parts[b].key) - weight(parts[a].key) || rank(parts[a].key) - rank(parts[b].key) || a - b)

  const tiers: ('s' | 'm' | 'l' | 'x')[] = parts.map(() => 's')
  let out = join(tiers)
  const upgrade = (i: number, next: 'm' | 'l' | 'x') => {
    if (next === 'x' && !parts[i].x) return
    const trial = [...tiers]; trial[i] = next
    const t = join(trial)
    if (t.length <= MAX_PROMPT) { tiers[i] = next; out = t }
  }
  if (s.fillPrompt) {
    // filling: everything to medium first so no section reads as a bare tag, then each
    // section takes its long and extra-long wording in weight order until the budget
    // runs out — sections set to weight 0 never expand beyond their brief wording
    for (const i of order) upgrade(i, 'm')
    for (const i of order) {
      if (weight(parts[i].key) === 0) continue
      upgrade(i, 'l'); upgrade(i, 'x')
    }
  } else {
    // not filling: the weight picks the template length directly —
    // high (2) = long wording, normal (1) = medium, brief (0) = shortest
    for (const i of order) {
      const w = weight(parts[i].key)
      if (w >= 1) upgrade(i, 'm')
      if (w === 2) upgrade(i, 'l')
    }
  }

  // still too long even at all-short (e.g. huge custom text): trim the custom text to the room that is left
  if (out.length > MAX_PROMPT && s.custom.trim()) {
    const base = parts.slice(0, -1).map((p, i) => p[tiers[i]] ?? p.l).filter(Boolean).join(', ')
    const room = MAX_PROMPT - base.length - 2
    out = room > 20 ? `${base}, ${s.custom.trim().slice(0, room).replace(/\s+\S*$/, '')}` : base
  }
  if (out.length > MAX_PROMPT) {
    out = out.slice(0, MAX_PROMPT)
    const cut = out.lastIndexOf(',')
    if (cut > MAX_PROMPT * 0.6) out = out.slice(0, cut)
  }
  return out.trim()
}

// ---- Progression sheet ----

const fmt = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const TEMPLATES: Record<string, string[][]> = {
  edm: [
    ['Intro', 'Verse', 'Chorus', 'Build', 'Drop', 'Verse', 'Build', 'Drop', 'Breakdown', 'Outro'],
    ['Intro', 'Build', 'Drop', 'Drop', 'Breakdown', 'Verse', 'Build', 'Drop', 'Outro'],
    ['Intro', 'Breakdown', 'Verse', 'Build', 'Drop', 'Breakdown', 'Build', 'Drop', 'Outro'],
    ['Intro', 'Build', 'Drop', 'Breakdown', 'Build', 'Drop', 'Outro'],
    ['Intro', 'Verse', 'Build', 'Drop', 'Breakdown', 'Verse', 'Build', 'Drop', 'Outro'],
    ['Intro', 'Breakdown', 'Build', 'Drop', 'Bridge', 'Build', 'Drop', 'Drop', 'Outro'],
    ['Intro', 'Build', 'Drop', 'Verse', 'Build', 'Drop', 'Breakdown', 'Outro'],
    ['Intro', 'Verse', 'Pre-Chorus', 'Drop', 'Verse', 'Pre-Chorus', 'Drop', 'Breakdown', 'Drop', 'Outro'],
    ['Intro', 'Drop', 'Breakdown', 'Build', 'Drop', 'Bridge', 'Drop', 'Outro'],
  ],
  trance: [
    ['Intro', 'Verse', 'Breakdown', 'Build', 'Drop', 'Verse', 'Breakdown', 'Build', 'Drop', 'Outro'],
    ['Intro', 'Build', 'Verse', 'Build', 'Drop', 'Breakdown', 'Bridge', 'Drop', 'Outro'],
    ['Intro', 'Verse', 'Build', 'Breakdown', 'Build', 'Drop', 'Verse', 'Outro'],
    ['Intro', 'Build', 'Drop', 'Breakdown', 'Build', 'Drop', 'Drop', 'Outro'],
    ['Intro', 'Verse', 'Verse', 'Breakdown', 'Build', 'Drop', 'Bridge', 'Drop', 'Outro'],
    ['Intro', 'Build', 'Verse', 'Breakdown', 'Build', 'Drop', 'Breakdown', 'Drop', 'Outro'],
  ],
  techno: [
    ['Intro', 'Verse', 'Verse', 'Build', 'Drop', 'Verse', 'Breakdown', 'Drop', 'Verse', 'Outro'],
    ['Intro', 'Breakdown', 'Verse', 'Build', 'Drop', 'Verse', 'Verse', 'Outro'],
    ['Intro', 'Verse', 'Build', 'Drop', 'Verse', 'Breakdown', 'Drop', 'Outro'],
    ['Intro', 'Verse', 'Verse', 'Breakdown', 'Build', 'Drop', 'Verse', 'Outro'],
    ['Intro', 'Build', 'Verse', 'Drop', 'Bridge', 'Drop', 'Breakdown', 'Outro'],
    ['Intro', 'Verse', 'Breakdown', 'Build', 'Drop', 'Drop', 'Verse', 'Outro'],
  ],
  bass: [
    ['Intro', 'Verse', 'Pre-Chorus', 'Drop', 'Breakdown', 'Build', 'Drop', 'Bridge', 'Drop', 'Outro'],
    ['Intro', 'Build', 'Drop', 'Breakdown', 'Verse', 'Build', 'Drop', 'Drop', 'Outro'],
    ['Intro', 'Build', 'Drop', 'Breakdown', 'Build', 'Drop', 'Outro'],
    ['Intro', 'Verse', 'Build', 'Drop', 'Bridge', 'Build', 'Drop', 'Drop', 'Outro'],
    ['Intro', 'Drop', 'Verse', 'Build', 'Drop', 'Breakdown', 'Drop', 'Outro'],
    ['Intro', 'Breakdown', 'Build', 'Drop', 'Verse', 'Build', 'Drop', 'Outro'],
  ],
  hard: [
    ['Intro', 'Verse', 'Build', 'Drop', 'Breakdown', 'Verse', 'Build', 'Drop', 'Drop', 'Outro'],
    ['Intro', 'Build', 'Drop', 'Bridge', 'Build', 'Drop', 'Breakdown', 'Build', 'Drop', 'Outro'],
    ['Intro', 'Build', 'Drop', 'Breakdown', 'Build', 'Drop', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Build', 'Drop', 'Breakdown', 'Build', 'Drop', 'Outro'],
    ['Intro', 'Drop', 'Breakdown', 'Verse', 'Build', 'Drop', 'Drop', 'Outro'],
  ],
  song: [
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Breakdown', 'Chorus', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Breakdown', 'Build', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Bridge', 'Chorus', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Verse', 'Chorus', 'Breakdown', 'Verse', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Breakdown', 'Verse', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Breakdown', 'Chorus', 'Outro'],
  ],
  hiphop: [
    ['Intro', 'Chorus', 'Verse', 'Chorus', 'Verse', 'Bridge', 'Chorus', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Breakdown', 'Verse', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Verse', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Chorus', 'Breakdown', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Chorus', 'Breakdown', 'Verse', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Outro'],
  ],
  rock: [
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Breakdown', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Breakdown', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Solo', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Verse', 'Chorus', 'Solo', 'Verse', 'Chorus', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Chorus', 'Breakdown', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Bridge', 'Solo', 'Breakdown', 'Chorus', 'Outro'],
  ],
  metal: [
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Breakdown', 'Build', 'Chorus', 'Outro'],
    ['Intro', 'Breakdown', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Breakdown', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Breakdown', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Build', 'Verse', 'Chorus', 'Verse', 'Breakdown', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Breakdown', 'Verse', 'Chorus', 'Solo', 'Breakdown', 'Outro'],
    ['Intro', 'Drop', 'Verse', 'Chorus', 'Bridge', 'Solo', 'Breakdown', 'Chorus', 'Outro'],
  ],
  jazz: [
    ['Intro', 'Chorus', 'Solo', 'Solo', 'Solo', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Solo', 'Breakdown', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Solo', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Solo', 'Bridge', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Solo', 'Breakdown', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Solo', 'Verse', 'Solo', 'Chorus', 'Outro'],
  ],
  folk: [
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Verse', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Breakdown', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Verse', 'Chorus', 'Verse', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Breakdown', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Verse', 'Verse', 'Bridge', 'Verse', 'Outro'],
  ],
  world: [
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Breakdown', 'Solo', 'Chorus', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Solo', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Chorus', 'Breakdown', 'Build', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Solo', 'Verse', 'Chorus', 'Chorus', 'Outro'],
  ],
  ambient: [
    ['Intro', 'Verse', 'Breakdown', 'Verse', 'Build', 'Chorus', 'Outro'],
    ['Intro', 'Build', 'Verse', 'Breakdown', 'Build', 'Breakdown', 'Outro'],
    ['Intro', 'Verse', 'Build', 'Breakdown', 'Verse', 'Outro'],
    ['Intro', 'Verse', 'Verse', 'Build', 'Chorus', 'Breakdown', 'Outro'],
    ['Intro', 'Breakdown', 'Verse', 'Build', 'Verse', 'Breakdown', 'Outro'],
    ['Intro', 'Verse', 'Build', 'Chorus', 'Breakdown', 'Build', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Bridge', 'Verse', 'Build', 'Outro'],
  ],
  instrumental: [
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Solo', 'Verse', 'Chorus', 'Breakdown', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Build', 'Chorus', 'Solo', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Build', 'Chorus', 'Verse', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Solo', 'Breakdown', 'Build', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Solo', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Verse', 'Chorus', 'Solo', 'Solo', 'Chorus', 'Outro'],
  ],
}
const GROUP_POOL: Record<string, string> = {
  house: 'edm', techno: 'techno', trance: 'trance', bass: 'bass', hard: 'hard', electronic: 'edm',
  hiphop: 'hiphop', pop: 'song', rock: 'rock', metal: 'metal', jazz: 'jazz', folk: 'folk', world: 'world',
  ambient: 'ambient', experimental: 'instrumental',
}

const ARRANGEMENT_TEMPLATES: Record<string, string[][]> = {
  acapella: [
    ['Intro', 'Verse', 'Verse', 'Chorus', 'Breakdown', 'Solo', 'Chorus', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Build', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Breakdown', 'Build', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Breakdown', 'Chorus', 'Outro'],
  ],
  beatbox: [
    ['Intro', 'Verse', 'Chorus', 'Build', 'Drop', 'Verse', 'Breakdown', 'Build', 'Drop', 'Outro'],
    ['Intro', 'Drop', 'Verse', 'Chorus', 'Solo', 'Breakdown', 'Build', 'Drop', 'Outro'],
    ['Intro', 'Verse', 'Build', 'Drop', 'Verse', 'Breakdown', 'Solo', 'Drop', 'Outro'],
    ['Intro', 'Solo', 'Verse', 'Chorus', 'Build', 'Drop', 'Breakdown', 'Drop', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Bridge', 'Drop', 'Outro'],
  ],
  unplugged: [
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Solo', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Breakdown', 'Verse', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Verse', 'Chorus', 'Breakdown', 'Verse', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Solo', 'Chorus', 'Outro'],
  ],
  stripped: [
    ['Intro', 'Verse', 'Verse', 'Chorus', 'Bridge', 'Verse', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Chorus', 'Breakdown', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Verse', 'Chorus', 'Breakdown', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Solo', 'Verse', 'Chorus', 'Outro'],
  ],
  live: [
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Solo', 'Chorus', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Chorus', 'Breakdown', 'Build', 'Chorus', 'Solo', 'Outro'],
    ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Breakdown', 'Chorus', 'Outro'],
    ['Intro', 'Solo', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Breakdown', 'Solo', 'Build', 'Chorus', 'Outro'],
  ],
  orchestralArr: [
    ['Intro', 'Verse', 'Verse', 'Build', 'Chorus', 'Solo', 'Breakdown', 'Build', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Breakdown', 'Verse', 'Build', 'Chorus', 'Bridge', 'Build', 'Chorus', 'Outro'],
    ['Intro', 'Verse', 'Build', 'Chorus', 'Breakdown', 'Build', 'Chorus', 'Outro'],
    ['Intro', 'Breakdown', 'Verse', 'Build', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    ['Intro', 'Chorus', 'Verse', 'Solo', 'Build', 'Chorus', 'Breakdown', 'Outro'],
  ],
}

// ---- progression style → section layout ----
// The "Progression style" choice reshapes the middle of the track (intro/outro untouched).
const cyc = (pattern: string[]) => (mid: string[]) => mid.map((_, i) => pattern[i % pattern.length])
const distinctSections = (mid: string[], r: () => number) => {
  const a = ['Verse', 'Build', 'Chorus', 'Breakdown', 'Bridge', 'Solo', 'Drop', 'Pre-Chorus']
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return mid.map((_, i) => a[i % a.length])
}
const endOn = (mid: string[], pre: string, last: string) => {
  if (mid.length >= 2) { mid[mid.length - 2] = pre; mid[mid.length - 1] = last } else if (mid.length) mid[0] = last
  return mid
}
const STYLE_MIDDLE: Record<string, (mid: string[], r: () => number) => string[]> = {
  'verse-chorus': cyc(['Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus']),
  aaba: cyc(['Verse', 'Verse', 'Bridge', 'Verse']),
  strophic: cyc(['Verse']),
  bluesform: cyc(['Verse', 'Verse', 'Solo', 'Verse']),
  ballad: (m) => m.map((_, i) => (i >= m.length - 2 ? 'Chorus' : ['Verse', 'Verse', 'Chorus'][i % 3])),
  hookfirst: (m) => m.map((x, i) => (i === 0 ? (m.includes('Drop') ? 'Drop' : 'Chorus') : x)),
  doublechorus: (m) => endOn([...m], m.includes('Drop') ? 'Drop' : 'Chorus', m.includes('Drop') ? 'Drop' : 'Chorus'),
  drops: cyc(['Verse', 'Build', 'Drop', 'Breakdown', 'Build', 'Drop']),
  breakdownheavy: cyc(['Verse', 'Breakdown', 'Build', 'Drop', 'Breakdown']),
  doubledrop: (m) => endOn(cyc(['Verse', 'Build', 'Drop', 'Breakdown'])(m), 'Build', 'Drop'),
  falsedrop: (m) => endOn(cyc(['Verse', 'Build', 'Drop', 'Breakdown'])(m), 'Build', 'Drop'),
  peakearly: (m) => m.map((x, i) => (i === 0 ? (m.includes('Drop') ? 'Drop' : 'Chorus') : x)),
  linear: distinctSections,
  throughcomposed: distinctSections,
  medley: distinctSections,
  loop: cyc(['Verse', 'Verse', 'Verse', 'Breakdown']),
  dynamic: cyc(['Build', 'Drop', 'Breakdown']),
  tidal: cyc(['Build', 'Chorus', 'Breakdown']),
  cinematicarc: (m) => m.map((_, i) => {
    const t = (i + 1) / (m.length + 1)
    return t < 0.3 ? 'Verse' : t < 0.5 ? 'Build' : t < 0.65 ? 'Chorus' : t < 0.8 ? 'Breakdown' : 'Chorus'
  }),
  jam: cyc(['Verse', 'Solo', 'Verse', 'Solo', 'Bridge']),
  falling: (m) => m.map((_, i) => {
    const t = i / m.length
    return t < 0.25 ? 'Chorus' : t < 0.5 ? 'Verse' : t < 0.75 ? 'Bridge' : 'Breakdown'
  }),
  quietloud: cyc(['Verse', 'Chorus']),
  twopart: (m) => m.map((x, i) => (i >= m.length / 2 ? ['Bridge', 'Breakdown', 'Chorus'][(i - Math.ceil(m.length / 2)) % 3] : x)),
  threeact: (m) => m.map((_, i) => {
    const t = i / m.length
    return t < 1 / 3 ? ['Verse', 'Build'][i % 2] : t < 2 / 3 ? ['Breakdown', 'Bridge'][i % 2] : ['Build', 'Chorus'][i % 2]
  }),
}

// style-specific colour for individual sheet lines (mi = index among middle sections, mn = middle count)
function styleNote(s: Settings, id: string, mi: number, mn: number, dropNo: number, r: () => number): string {
  const first = mi === 0, last = mi === mn - 1, midpt = mi === Math.floor(mn / 2)
  switch (s.progression) {
    case 'build': return first ? 'starting from almost nothing' : last ? 'the fullest the track gets' : ''
    case 'minimal': return first ? 'just a couple of elements to begin with' : ''
    case 'crescendo': return last ? 'the single climax the whole track has been building toward' : ''
    case 'plateau': return mi === 1 ? 'full energy reached already and held from here on' : ''
    case 'terraced': return mi > 0 && mi % 2 === 0 ? 'a clear step up in energy from the last section' : ''
    case 'latebloom': return last ? 'the track finally opens up to full size' : mi === mn - 2 ? 'still holding back, hinting at what is coming' : ''
    case 'falsedrop': return id === 'Drop' ? (dropNo === 0 ? 'a teased false drop that cuts away just before it lands' : dropNo === 1 ? 'the real drop this time, at full weight' : '') : ''
    case 'doubledrop': return id === 'Drop' && dropNo === 1 ? 'the second drop, bigger than the first' : ''
    case 'peakearly': return first ? 'the peak lands right away' : mi === 1 ? 'settling into the groove after the early peak' : ''
    case 'loop': return midpt ? 'the loop keeps running, mutating in small details' : ''
    case 'sudden': return mi > 0 && r() < 0.4 ? 'entered by an abrupt cut, no transition' : ''
    case 'callresponse': return r() < 0.35 ? 'built on call-and-response phrases' : ''
    case 'tempochange': return midpt ? 'the tempo changes deliberately here' : ''
    case 'halftimeswitch': return last ? 'switched to half-time, twice as heavy' : ''
    case 'genreswitch': {
      if (!midpt) return ''
      const g2 = s.genres[1] ? GENRES.find((x) => x.id === s.genres[1])?.tag : ''
      return g2 ? `switches into ${g2} for this section before returning` : 'switches genre for this section before returning'
    }
    case 'quietloud': return ['Chorus', 'Drop'].includes(id) ? 'suddenly loud' : id === 'Verse' ? 'kept deliberately quiet' : ''
    case 'twopart': return mi === Math.ceil(mn / 2) ? 'the second movement begins, a deliberate contrast to the first half' : ''
    case 'threeact': return mi === Math.ceil(mn / 3) ? 'act two: the mood shifts' : mi === Math.ceil((2 * mn) / 3) ? 'act three: heading for resolution' : ''
    case 'medley': case 'throughcomposed': return r() < 0.4 ? 'a new theme, distinct from what came before' : ''
    case 'linear': return r() < 0.35 ? 'still evolving, nothing repeated' : ''
    default: return ''
  }
}

function pickSections(s: Settings, r: () => number): string[] {
  const n = Math.max(3, Math.min(16, s.sectionCount))
  let base: string[]
  if (s.structure !== 'auto') base = pick(r, TEMPLATES[s.structure])
  else if (ARRANGEMENT_TEMPLATES[s.arrangement]) base = pick(r, ARRANGEMENT_TEMPLATES[s.arrangement])
  else {
    // first selected genre's group decides the pool; instrumental tracks in song-form groups use the instrumental pool
    const group = s.genres.length ? genreGroupOf(s.genres[0]) : undefined
    let key = group ? GROUP_POOL[group] ?? 'song' : s.vocals === 'none' ? 'instrumental' : 'song'
    if (s.vocals === 'none' && ['song', 'hiphop', 'folk'].includes(key)) key = 'instrumental'
    base = pick(r, TEMPLATES[key])
  }
  const middle = base.slice(1, -1)
  const edges = (s.hasIntro ? 1 : 0) + (s.hasOutro ? 1 : 0)
  let mid: string[] = []
  for (let i = 0; i < n - edges; i++) mid.push(middle[i % middle.length])
  const styled = STYLE_MIDDLE[s.progression]
  if (styled) mid = styled(mid, r)
  return [...(s.hasIntro ? ['Intro'] : []), ...mid, ...(s.hasOutro ? ['Outro'] : [])]
}

function energyAt(t: number, curve: Settings['energyCurve']): number {
  // t in [0,1], returns 0..1
  switch (curve) {
    case 'rise': return 0.2 + 0.8 * t
    case 'fall': return 1 - 0.8 * t
    case 'peak-mid': return 0.25 + 0.75 * Math.sin(Math.PI * t)
    case 'waves': return 0.35 + 0.65 * Math.abs(Math.sin(Math.PI * 2.5 * t))
    case 'layers': return 0.15 + 0.85 * t
    case 'flat': default: return 0.6
  }
}

const ENERGY_WORDS = [
  ['sparse, minimal', 'barely there, airy', 'quiet and spacious'],
  ['soft, restrained', 'gentle, held back', 'low-key, intimate'],
  ['steady groove', 'settled, mid energy', 'locked-in pulse'],
  ['building intensity', 'rising momentum', 'gaining power'],
  ['full energy', 'driving, powerful', 'high energy'],
  ['peak intensity, everything in', 'maximum intensity, all layers', 'climax, wall of sound'],
]
const energyWord = (e: number, r: () => number) =>
  pick(r, ENERGY_WORDS[Math.min(ENERGY_WORDS.length - 1, Math.floor(e * ENERGY_WORDS.length))])

const SECTION_HINTS: Record<string, string[]> = {
  Intro: [
    'atmospheric opening, pads and a hint of the main melody emerge from silence',
    'filtered intro with the main motif teased through a low-pass filter that slowly opens',
    'ambient textures and a distant rhythmic pulse fade in, setting the key and tempo',
    'drums-only intro with the hook hinted on a single instrument before anything else enters',
    'cold open straight on the main riff, bold and unapologetic, the full groove arrives fast',
    'reversed swell and a rising noise bed lead into the first downbeat',
    'a lone melodic phrase played twice, the second time answered by a soft bass note',
  ],
  Verse: [
    'main groove settles in, vocals or lead melody take the story forward over a restrained backing',
    'tight rhythm section with a melodic hook repeating underneath, leaving room for the lead',
    'laid-back groove, bass and drums locked, chords sparse, plenty of space in the arrangement',
    'syncopated groove with call-and-response between the lead and a countermelody',
    'sparse verse with bass and lead upfront, percussion minimal, tension held back on purpose',
    'rolling rhythm, the melody develops with small variations each time it comes around',
    'second verse adds a counter-line and light percussion so it feels fuller than the first',
  ],
  'Pre-Chorus': [
    'rising tension as layers stack up, the chords climb and the drums tighten toward the chorus',
    'snare build with the vocals lifting in pitch and intensity, harmony notes creeping in',
    'chords climb and filters open, a riser underneath signals the chorus is coming',
    'drums pull back for two bars of anticipation, then a fill launches into the chorus',
  ],
  Chorus: [
    'big hook with the full arrangement in, wide harmonies and the melody at its most memorable',
    'anthemic chorus, everything doubled and widened, the hook sung or played with conviction',
    'hook repeats with layers doubled, a counter-melody on top and the bass driving underneath',
    'euphoric chorus with stacked harmonies and a soaring top line over a pumping rhythm',
    'final chorus with octave-up melody, extra percussion and ad-libs, the biggest moment of the track',
    'chorus lands with full drums and a wide chord bed, the hook repeated so it sticks',
  ],
  Build: [
    'risers, a snare roll and white noise sweeping up while the bass drops out to make room',
    'filter sweep and climbing tension, the kick accelerates into a double-time pattern',
    'everything cuts except a rising pitch and a snare roll, pure anticipation',
    'layered arpeggios stack up, drums add fills every bar, the energy ratchets upward',
    'the melody repeats higher each time over an accelerating drum build and a long riser',
  ],
  Drop: [
    'massive drop with heavy bass and full drums, the main theme hammered home',
    'drop hits with a driving rhythm, the lead riff front and centre, crowd-moment energy',
    'drop with a new lead melody layered on top of the original hook, bass at full weight',
    'half-time drop with a huge low end and space between the hits, heavy and wide',
    'drop variation with stutter edits, vocal chops and rhythmic fills, a remix of the first drop',
    'full-energy drop, every element in, the groove at its most physical',
  ],
  Breakdown: [
    'strip back to pads and the melody alone, drums out, the emotional centre of the track',
    'drums drop away leaving bass, chords and a fragile lead, reverb tails exposed',
    'only bass and a single voice remain, the tempo felt but barely played',
    'ambient breakdown with long reverb tails and a slow chord progression, time stretches out',
    'piano-led breakdown restating the main theme quietly before the energy returns',
    'breakdown with a new, unexpected chord turn and soft textures, a moment to breathe',
  ],
  Bridge: [
    'key change and a new perspective on the melody, fresh chords under a familiar hook',
    'half-time bridge, sparse and moody, the drums drop to a slow pattern and the bass leads',
    'a new chord progression, darker and more tense, setting up the final section',
    'bridge with a spoken-word or half-sung feel over a minimal backing, contrast by restraint',
    'modulation up a step with a rising counter-melody, building toward the last chorus',
  ],
  Solo: [
    'expressive instrumental solo over the chorus chords, building from simple phrases to a peak',
    'the lead instrument takes over with a melodic solo that quotes the hook and then departs from it',
    'trading solo phrases between two instruments, each answering the other',
    'a melodic, singable solo that stays close to the main theme before breaking free in the last bars',
  ],
  Outro: [
    'elements fade out one by one, the melody the last thing standing',
    'final chord rings out with a long reverb tail and a last hint of the main motif',
    'the loop slowly fades to silence, filters closing, the tempo felt until the very end',
    'reprise of the intro motif, bringing the track full circle before it dissolves',
    'hard stop on the last hit with a reverb tail, then silence',
    'a slow fade with the hook repeating softer each time, layers thinning out',
  ],
}

// a second, seeded detail clause per section type, appended to the hint
const SECTION_DETAILS: Record<string, string[]> = {
  Intro: ['soft dynamics', 'tempo established by a subtle pulse', 'tonal centre set by a sustained note', 'mostly textures, no full drums yet'],
  Verse: ['drums steady and understated', 'harmony kept simple', 'lead phrased conversationally', 'bass carries the movement'],
  'Pre-Chorus': ['harmony rises', 'percussion thickens', 'melody climbs toward the hook', 'dynamics swelling'],
  Chorus: ['full drums and bass', 'wide stereo image', 'harmonies stacked', 'melody at its highest register'],
  Build: ['bass removed', 'snare roll doubling speed', 'noise riser sweeping up', 'filter opening over eight bars'],
  Drop: ['sub bass at full weight', 'kick and snare hitting hard', 'lead doubled and saturated', 'maximum width and density'],
  Breakdown: ['no kick', 'reverb and delay exposed', 'harmony slowed to one chord per bar', 'intimate and close'],
  Bridge: ['new chords', 'contrasting texture', 'tension held unresolved', 'rhythm simplified'],
  Solo: ['rhythm section holds the groove', 'solo grows in range and intensity', 'chords from the chorus', 'ends on a held note into the next section'],
  Outro: ['layers thinning', 'tempo felt but softer', 'last motif statement', 'long decay into silence'],
}

const ARRANGEMENT_HINTS: Record<string, Partial<Record<string, string[]>>> = {
  acapella: {
    Intro: ['a solo voice hums the main motif, a second voice joins on a sustained note', 'soft vocal pad of "oohs" with a single lead line entering over it', 'whispered count-in, then a lone voice states the melody unaccompanied'],
    Verse: ['lead vocal over a hummed bassline and "ooh" harmonies, rhythm implied by the phrasing', 'tight vocal rhythm with a light beatbox pulse and two-part harmony under the lead', 'lead vocal and vocal bass only, the harmonies held back for later'],
    'Pre-Chorus': ['harmonies stack voice by voice, a rising vocal swell leads into the chorus', 'the bass voice drops out and the harmonies climb, building pressure'],
    Chorus: ['full vocal stack with rich four-part harmonies and a confident lead on top', 'anthemic chorus with a wide choral spread, vocal bass and percussive vocal rhythm', 'the whole choir in, the hook sung in unison then splitting into harmony'],
    Build: ['layered "ahs" rise in pitch while a beatbox pattern accelerates underneath', 'voices stack a long rising chord, the rhythm tightening bar by bar'],
    Drop: ['full vocal stack with percussive vocals, vocal bass and the hook at full volume', 'everything in: beatboxed drums, layered bass voices and stacked harmonies'],
    Breakdown: ['down to a single solo voice, the harmonies falling away one at a time', 'two voices in close harmony, no rhythm, intimate and exposed'],
    Bridge: ['close harmony with a key lift, hushed dynamics and a new melodic idea', 'a counter-melody sung against the hook, sparse and tense'],
    Solo: ['vocal ad-lib solo, scatting or riffing over the hummed chords', 'beatbox feature or improvised vocal runs while the choir holds a pad'],
    Outro: ['harmonies thin out to a single voice humming the motif', 'final chord held a cappella with a slow fade, one voice lingering', 'the choir resolves on a sustained chord and fades'],
  },
  beatbox: {
    Intro: ['mouth hi-hats and a soft kick set the tempo, a vocal bass drone underneath', 'vocal bass drone with beatbox clicks and rimshots entering, groove hinted', 'a lone beatbox pattern, then the hummed bassline joins'],
    Verse: ['beatbox groove with a hummed bassline and the lead vocal on top', 'tight kick-snare pattern, lip bass and a restrained lead vocal', 'sparse beatbox with the lead vocal phrased over it, harmonies absent'],
    'Pre-Chorus': ['snare rolls by mouth while the harmonies rise and the bass voice climbs', 'beatbox tightens into a build pattern, voices stacking'],
    Chorus: ['full beatbox kit with stacked vocal harmonies and the hook sung big', 'big hook over a heavy vocal bass and a driving beatbox pattern', 'chorus with vocal percussion fills and layered harmonies'],
    Build: ['rapid-fire beatbox roll with a lip-bass riser and rising harmonies', 'the beat drops to hi-hats only while voices build a long rising chord'],
    Drop: ['heavy beatbox drop with a bass cannon, inward snare and stacked harmonies', 'dubstep-style vocal wobble drop, throat bass and hard mouth snares', 'the hook returns over a full-power beatbox kit'],
    Breakdown: ['the beat stops, leaving a solo voice and a soft vocal pad', 'beatbox drops to a heartbeat pulse under quiet harmonies'],
    Bridge: ['half-time beatbox with throat bass, sparse and heavy', 'new chords sung in close harmony over a minimal beat'],
    Solo: ['beatbox solo with technical patterns, scratches and trumpet imitations', 'a vocal bass solo traded with drum fills by mouth'],
    Outro: ['the beat thins to hi-hats, a final vocal chord holds and fades', 'beatbox fades with one last bass hit and the hook hummed softly'],
  },
  unplugged: {
    Intro: ['fingerpicked acoustic guitar with room ambience, the chord progression stated once', 'gentle piano and brushed snare, a melody hinted on the top notes', 'a soft strummed intro with a hummed melody over it'],
    Verse: ['acoustic guitar strum and an intimate vocal, upright bass walking underneath', 'light percussion, upright bass and a close-miked vocal, harmonies held back', 'piano and voice only, rubato feel, the band waits'],
    'Pre-Chorus': ['strumming intensifies, harmonies enter and the kick drum appears', 'the band leans in, chords climbing, a tambourine joins'],
    Chorus: ['full acoustic strum with stomps, claps and stacked harmonies', 'warm chorus with harmonies, shakers and the bass driving the groove', 'the whole room sings the hook over a full acoustic band'],
    Build: ['tremolo strings swell while the drums add floor tom and the strum speeds up', 'a long crescendo, guitars doubled, harmonies rising'],
    Drop: ['the full acoustic band hits at once with stomps and claps, loud and joyful', 'the chorus arrives at full power, everyone playing'],
    Breakdown: ['down to guitar and voice only, the room noise audible', 'a quiet piano passage, the rest of the band silent'],
    Bridge: ['sparse piano and an intimate vocal moment, the band returns gently', 'a new progression on acoustic guitar with a soft harmony line'],
    Solo: ['acoustic guitar or violin solo over the chorus chords, lyrical and warm', 'a fiddle or harmonica solo, the band vamping underneath'],
    Outro: ['instruments drop out one by one, the last strum rings with room reverb', 'room noise, a final picked chord and a gentle fade', 'the melody hummed once more over a single guitar'],
  },
  stripped: {
    Intro: ['a single instrument states the theme alone, lots of air around it', 'one sustained chord and a slow melodic fragment'],
    Verse: ['one instrument and voice with lots of space, every note deliberate', 'minimal chords and the vocal upfront, no drums', 'bass and voice only, the pulse implied'],
    'Pre-Chorus': ['a second layer enters quietly, the harmony thickening by one note'],
    Chorus: ['still intimate with a slight lift, a soft harmony doubling the hook', 'restrained chorus, soft harmonies and the main instrument a little fuller'],
    Build: ['a subtle swell with no drums, dynamics rising by a hair'],
    Drop: ['a gentle arrival with modest dynamics, the fullest moment but still sparse'],
    Breakdown: ['near silence, the bare melody on one instrument'],
    Bridge: ['a change of texture, whisper-quiet, a new chord colour'],
    Solo: ['a sparse melodic solo with long notes and silence between phrases'],
    Outro: ['fade to a single sustained note that decays into silence'],
  },
  live: {
    Intro: ['crowd ambience and the band warming in, a few notes tuning up before the count', 'count-in, then a live room intro, drums and bass finding the groove', 'the band drops into the intro riff, crowd reacting'],
    Verse: ['live band groove with a raw, unquantised feel and audible room', 'the band locks in, rhythm guitar and bass driving, vocal slightly ahead of the beat', 'verse played loose and confident, small fills between lines'],
    'Pre-Chorus': ['drums build with crowd anticipation, guitars swelling'],
    Chorus: ['full band with the crowd singing along to the hook', 'big live chorus, energetic and slightly rough around the edges', 'the hook shouted back by the audience over full band'],
    Build: ['a drum fill build with the band swelling into the next section'],
    Drop: ['the band slams in together and the crowd roars', 'full band hit, every instrument at full volume'],
    Breakdown: ['the band drops out leaving a crowd clap-along and a lone guitar', 'quiet breakdown with a spoken aside to the audience'],
    Bridge: ['a jam section, loose and dynamic, the band following each other'],
    Solo: ['an extended live solo while the band vamps, building to a peak', 'trading solos between instruments, the crowd responding'],
    Outro: ['a big ending, crash cymbal, applause', 'the band jams out and the applause fades', 'a final sustained chord, drum roll and the crowd cheering'],
  },
  pianovocal: {
    Intro: ['solo piano states the chord progression, a few melody notes on top', 'a quiet piano figure repeats, the voice hums the first line'],
    Verse: ['piano left hand keeps a gentle pulse while the voice tells the story', 'sparse piano chords under an intimate vocal, lots of space'],
    Chorus: ['piano opens up with fuller chords and octaves, the voice lifts into the hook', 'the chorus is bigger only by the piano playing harder and the voice going higher'],
    Breakdown: ['the piano drops to single notes, the voice almost whispered'],
    Bridge: ['a new progression, the piano moves to the upper register, voice in harmony with itself'],
    Solo: ['a lyrical piano passage on the chorus chords'],
    Outro: ['the last chorus line sung over a single held piano chord', 'piano resolves slowly, a final arpeggio and the sustain pedal'],
  },
  clubedit: {
    Intro: ['DJ-friendly intro: kick and hi-hats only for 16 bars, percussion layers added gradually', 'beat-only intro, a filtered hint of the hook far in the background'],
    Verse: ['the groove with bass and chords in, vocal hook still filtered or absent', 'full groove, percussion busy, chords looping'],
    Build: ['snare roll and riser, bass pulled out, filter opening'],
    Drop: ['the full hook lands with bass and every layer, peak dance-floor moment', 'second drop with a variation on the bass and extra percussion'],
    Breakdown: ['drums out, pads and vocal hook alone, a long reverb space'],
    Outro: ['DJ-friendly outro: layers removed one by one down to kick and hats for 16 bars', 'beat-only outro, the hook filtered away, steady kick until the end'],
  },
  ambientArr: {
    Intro: ['a single drone fades in from silence, the key established by a slow swell', 'high shimmer and a distant low drone, nothing rhythmic'],
    Verse: ['slow pads drift over the drone, a sparse melody appears and disappears', 'layered textures evolve almost imperceptibly, the harmony shifts once'],
    Build: ['a long swell with more layers entering, brightness increasing', 'the drone thickens, a high texture rises over many bars'],
    Chorus: ['the fullest moment: layered pads, shimmer and a slow melody together', 'all textures in, wide and glowing, still beatless'],
    Breakdown: ['everything recedes to a single pad and a field recording', 'near silence, the drone alone'],
    Bridge: ['a harmonic shift to a darker colour, the textures reorganise'],
    Outro: ['layers fade one by one until only the drone remains, then silence', 'a slow fade over the last minute, the shimmer the last to go'],
  },
  orchestralArr: {
    Intro: ['strings swell from silence while woodwinds introduce the theme', 'soft horns and a timpani roll set a cinematic tone', 'a solo instrument states the theme over sustained low strings'],
    Verse: ['strings carry the melody with light pizzicato accompaniment', 'woodwinds and harp, gentle and transparent, the theme developed', 'violas and cellos share the melody over a soft bass pulse'],
    'Pre-Chorus': ['brass enters and the strings climb, a crescendo building'],
    Chorus: ['full orchestra with soaring strings and brass stating the main theme', 'triumphant tutti with percussion and choir', 'the theme in full orchestral colour, horns and violins doubled'],
    Build: ['a long crescendo, snare rolls, string tremolo and brass swells'],
    Drop: ['an orchestral hit, full tutti with choir and timpani'],
    Breakdown: ['a solo cello or oboe, sparse and exposed, the orchestra silent', 'harp and flute alone, the theme fragmented'],
    Bridge: ['a modulation with dark low brass and a new, unsettled harmony'],
    Solo: ['a solo violin over sustained strings, lyrical and free'],
    Outro: ['the orchestra resolves on a final sustained chord, a last timpani roll', 'strings fade to silence, one note held by the woodwinds', 'a quiet restatement of the theme, then the final chord'],
  },
}

const DEFAULT_LAYERS: Record<string, string[]> = {
  full: ['drums', 'bass', 'chords', 'lead melody', 'pads', 'percussion', 'harmonies', 'fx and risers'],
  acapella: ['lead voice', 'vocal bass', 'low harmonies', 'high harmonies', 'vocal percussion', 'ad-libs'],
  beatbox: ['beatbox kick and snare', 'lip bass', 'hi-hats', 'lead vocal', 'harmonies', 'vocal fx and scratches'],
  unplugged: ['acoustic guitar', 'vocal', 'upright bass', 'brushed drums', 'piano', 'harmonies', 'strings'],
  stripped: ['piano', 'vocal', 'soft pad', 'light percussion', 'harmonies'],
  live: ['drums', 'bass', 'rhythm guitar', 'vocal', 'keys', 'lead guitar', 'backing vocals'],
  orchestralArr: ['low strings', 'woodwinds', 'violins', 'horns', 'timpani', 'brass', 'choir'],
  pianovocal: ['piano left hand', 'vocal', 'piano right-hand chords', 'piano countermelody', 'harmonies'],
  guitarvocal: ['guitar', 'vocal', 'guitar bass notes', 'harmonies', 'percussive strums'],
  band: ['drums', 'bass', 'rhythm guitar', 'keys', 'vocal', 'lead guitar', 'backing vocals'],
  bigband: ['rhythm section', 'saxes', 'trombones', 'trumpets', 'vocal', 'ensemble hits', 'solo feature'],
  quartet: ['cello', 'viola', 'second violin', 'first violin', 'pizzicato accents'],
  electronicArr: ['drum machine', 'synth bass', 'pads', 'lead synth', 'arpeggio', 'vocal chops', 'fx and risers'],
  lofiArr: ['vinyl crackle', 'soft drums', 'bass', 'rhodes chords', 'melody', 'vocal', 'tape textures'],
  clubedit: ['kick', 'hi-hats and percussion', 'bass', 'chords', 'vocal hook', 'lead', 'fx and risers'],
  remix: ['new drums', 'new bass', 'original vocal', 'new chords', 'lead', 'vocal chops', 'fx'],
  choirArr: ['organ pedal', 'organ chords', 'bass voices', 'tenors', 'altos', 'sopranos'],
  chamber: ['cello', 'piano', 'violin', 'clarinet or flute', 'viola'],
  marching: ['bass drums', 'snare line', 'cymbals', 'low brass', 'trumpets', 'melody section', 'full ensemble'],
  solo: ['melody', 'bass notes', 'chords', 'ornaments', 'dynamics'],
  duo: ['first instrument', 'second instrument', 'counter-lines', 'harmonised melody'],
  ambientArr: ['drone', 'pad', 'texture', 'slow melody', 'field recordings', 'high shimmer'],
  hybrid: ['live drums', 'synth bass', 'guitar', 'pads', 'vocal', 'programmed percussion', 'lead synth'],
  wallofsound: ['drums', 'bass', 'layered guitars', 'keys', 'strings', 'vocal', 'doubled vocals', 'brass'],
  gospel: ['piano', 'organ', 'bass', 'drums', 'lead vocal', 'choir', 'claps'],
  vocalgroup: ['lead voice', 'bass voice', 'harmony 1', 'harmony 2', 'light percussion', 'keys'],
  trio: ['first instrument', 'second instrument', 'third instrument', 'harmonies'],
  campfire: ['acoustic guitar', 'lead vocal', 'group vocals', 'claps', 'harmonica'],
  folkensemble: ['guitar', 'upright bass', 'vocal', 'fiddle', 'mandolin', 'harmonies'],
  pianoconcerto: ['piano', 'low strings', 'violins', 'woodwinds', 'brass', 'timpani'],
  epicorchestral: ['low drums', 'low strings', 'brass', 'choir', 'violins', 'percussion hits', 'high choir'],
  brassband: ['tubas', 'euphoniums', 'horns', 'cornets', 'percussion'],
  windensemble: ['low brass', 'clarinets', 'flutes', 'saxes', 'trumpets', 'percussion'],
  jazztrio: ['upright bass', 'brushed drums', 'piano comping', 'piano melody', 'piano solo'],
  jazzcombo: ['bass', 'drums', 'piano', 'trumpet', 'sax', 'ensemble head'],
  soulband: ['drums', 'bass', 'keys', 'guitar', 'lead vocal', 'horns', 'backing vocals'],
  lounge: ['brushed drums', 'bass', 'soft keys', 'vibraphone', 'guitar', 'vocal'],
  funkband: ['drums', 'slap bass', 'rhythm guitar', 'clavinet', 'horn stabs', 'vocal', 'percussion'],
  radioedit: ['drums', 'bass', 'chords', 'vocal', 'hook layers', 'harmonies'],
  dubversion: ['drums', 'heavy bass', 'skank guitar', 'organ', 'vocal fragments', 'delay throws', 'melodica'],
  modularjam: ['sequence', 'kick', 'bass voice', 'percussion voice', 'lead voice', 'noise and fx'],
  liveelectronic: ['drum machine', 'bass synth', 'chords', 'lead', 'percussion', 'vocal sample', 'fx'],
  latinband: ['congas', 'bass tumbao', 'piano montuno', 'timbales', 'horns', 'lead vocal', 'coro'],
  afroensemble: ['shekere and congas', 'bass', 'rhythm guitars', 'drums', 'horns', 'lead vocal', 'chorus vocals'],
  reggaeband: ['drums', 'bass', 'skank guitar', 'organ bubble', 'vocal', 'horns', 'percussion'],
  mariachiArr: ['guitarrón', 'vihuela', 'violins', 'trumpets', 'vocal', 'gritos'],
  celticArr: ['guitar', 'bodhrán', 'fiddle', 'tin whistle', 'vocal', 'harmonies'],
  indianensemble: ['tanpura', 'tabla', 'sitar', 'bansuri', 'vocal'],
  flamencoArr: ['guitar', 'palmas', 'cajón', 'vocal', 'second guitar'],
  gamelan: ['gongs', 'low metallophones', 'mid metallophones', 'high metallophones', 'drums', 'flute'],
}

export function buildLayers(s: Settings): string[] {
  if (s.layers.length) return s.layers.map((l) => l.name)
  return autoLayers(s)
}

export function autoLayers(s: Settings): string[] {
  const chosen = tags(INSTRUMENTS, s.instruments)
  const v = VOCALS.find((x) => x.id === s.vocals)
  const layers = [...chosen]
  if (v && s.vocals !== 'none') layers.push(v.tag)
  const fallback = DEFAULT_LAYERS[s.arrangement] ?? DEFAULT_LAYERS.full
  const similar = (a: string, b: string) => {
    const wa = a.toLowerCase().split(/\s+/), wb = b.toLowerCase().split(/\s+/)
    return wa.some((w) => w.length > 3 && wb.some((x) => x.startsWith(w.slice(0, 4))))
  }
  const max = Math.max(2, Math.min(8, s.sectionCount - 1))
  for (const f of fallback) if (layers.length < max && !layers.some((l) => similar(l, f))) layers.push(f)
  return layers.slice(0, max)
}

export function buildProgression(s: Settings): string[] {
  const r = rng(s.progSeed || s.seed)
  const total = Math.min(MAX_LENGTH, Math.max(30, s.lengthSec))
  const sections = pickSections(s, r)
  const intro = s.hasIntro ? Math.min(s.introSeconds, total * 0.3) : 0
  const outro = s.hasOutro ? Math.min(s.outroSeconds, total * 0.3) : 0
  const middle = sections.filter((id) => id !== 'Intro' && id !== 'Outro')
  const weightSum = middle.reduce((a, id) => a + (SECTION_TYPES.find((x) => x.id === id)?.weight ?? 1), 0)
  const middleLen = total - intro - outro

  const arrHints = ARRANGEMENT_HINTS[s.arrangement] ?? {}
  const moodWord = s.moods.length ? tags(MOODS, s.moods)[Math.floor(r() * s.moods.length)] : ''
  const vocalTag = s.vocals !== 'none' ? VOCALS.find((x) => x.id === s.vocals)?.tag : ''
  const lines: string[] = []
  const used = new Set<string>()
  const layered = s.energyCurve === 'layers'
  const layers = layered ? buildLayers(s) : []
  const entryOf = (name: string) => s.layers.find((l) => l.name === name)?.entry ?? ''
  let t = 0
  const leadInst = s.instruments[0] ? INSTRUMENTS.find((x) => x.id === s.instruments[0])?.tag : undefined
  const middleCount = sections.length - (s.hasIntro ? 1 : 0) - (s.hasOutro ? 1 : 0)
  let dropNo = 0

  sections.forEach((id, i) => {
    const w = SECTION_TYPES.find((x) => x.id === id)?.weight ?? 1
    const dur = id === 'Intro' ? intro : id === 'Outro' ? outro : (middleLen * w) / weightSum
    const start = t, end = Math.min(total, t + dur)
    const o = s.sectionOverrides[i]
    const e = o && o.energy >= 0 ? Math.max(0, Math.min(1, o.energy / 100)) : energyAt((start + dur / 2) / total, s.energyCurve)
    const hints = arrHints[id] ?? SECTION_HINTS[id]
    const fresh = hints.filter((h) => !used.has(h))
    let hint = pick(r, fresh.length ? fresh : hints)
    used.add(hint)
    // second detail clause
    const details = SECTION_DETAILS[id] ?? []
    if (details.length) hint += `, ${pick(r, details)}`
    // context from the user's selection (seeded so it doesn't appear on every line)
    const ctx: string[] = []
    if (leadInst && ['Intro', 'Verse', 'Chorus', 'Bridge'].includes(id) && r() < 0.5) ctx.push(pick(r, [`${leadInst} prominent`, `${leadInst} carries the melody`, `${leadInst} answering the lead`]))
    if (vocalTag && ['Verse', 'Pre-Chorus', 'Chorus', 'Bridge'].includes(id) && r() < 0.5) ctx.push(pick(r, [`${vocalTag} upfront`, `${vocalTag} with harmonies`, `${vocalTag} restrained`]))
    if (moodWord && !o?.moods.length && r() < 0.4) ctx.push(pick(r, [`${moodWord} feel`, `keeps the ${moodWord} tone`, `${moodWord} and focused`]))
    if (ctx.length) hint += `, ${ctx.join(', ')}`
    // explicit per-section direction from the section mix editor
    if (o?.genres.length) {
      const g = tags(GENRES, o.genres.filter((id) => s.genres.includes(id)))
      if (g.length) hint += `, ${pick(r, [`${listOf(g)} take the lead here`, `leaning fully into ${listOf(g)}`, `this section lives in ${listOf(g)} territory`])}`
    }
    if (o?.moods.length) {
      const mm = tags(MOODS, o.moods.filter((id) => s.moods.includes(id)))
      if (mm.length) hint += `, ${pick(r, [`${listOf(mm)} mood front and centre`, `the feel here is ${listOf(mm)}`, `${listOf(mm)} in tone`])}`
    }
    // reflect the chosen progression style in the sheet lines
    if (id === 'Intro' && s.progression === 'dj') hint += ', kept beat-only and DJ-friendly for mixing'
    else if (id === 'Outro' && s.progression === 'dj') hint += ', beat-only outro, easy to mix out of'
    else if (id === 'Outro' && s.progression === 'circular') hint += ', the intro motif returns and the track ends where it began'
    else if (id !== 'Intro' && id !== 'Outro') {
      const note = styleNote(s, id, i - (s.hasIntro ? 1 : 0), middleCount, id === 'Drop' ? dropNo++ : dropNo, r)
      if (note) hint += `, ${note}`
    }
    const vocalLed = ['acapella', 'beatbox'].includes(s.arrangement)
    if (id === 'Solo' && leadInst && !vocalLed && s.arrangement !== 'orchestralArr') hint = `${leadInst} solo`
    if (vocalLed && leadInst && ['Breakdown', 'Bridge', 'Intro'].includes(id) && r() < 0.6) hint += `, faint ${leadInst} underneath`
    if (layered) {
      const last = s.hasOutro ? sections.length - 1 : sections.length
      if (id === 'Outro') hint = `${hint}, layers drop out one by one`.replace('elements fade out one by one, ', '')
      else {
        const count = Math.max(1, Math.min(layers.length, Math.round(((i + 1) / last) * layers.length)))
        const active = layers.slice(0, count)
        const added = layers.slice(Math.max(0, Math.min(layers.length, Math.round((i / last) * layers.length))), count)
        const adds = added.map((a) => (entryOf(a) ? `${a} (${entryOf(a)})` : a))
        hint = `${hint}, ${adds.length ? `add ${adds.join(' + ')}` : 'hold current layers'}, now playing: ${active.join(', ')}`
      }
    }
    lines.push(`[${fmt(start)}-${fmt(end)} ${id}: ${hint}, ${energyWord(e, r)}]`)
    t = end
  })
  return lines
}

export function sanitize(input: unknown): Settings {
  const i = (input ?? {}) as Record<string, unknown>
  const str = (k: string, d: string) => (typeof i[k] === 'string' ? (i[k] as string).slice(0, 80) : d)
  const num = (k: string, d: number, lo: number, hi: number) => (typeof i[k] === 'number' && Number.isFinite(i[k]) ? Math.min(hi, Math.max(lo, i[k] as number)) : d)
  const arr = (k: string) => (Array.isArray(i[k]) ? (i[k] as unknown[]).filter((x) => typeof x === 'string').slice(0, 40) as string[] : [])
  const d = DEFAULT_SETTINGS
  return {
    genres: arr('genres'), instruments: arr('instruments'), moods: arr('moods'), production: arr('production'),
    progression: str('progression', d.progression), vocals: str('vocals', d.vocals), arrangement: str('arrangement', d.arrangement),
    era: str('era', d.era), key: str('key', d.key), scale: str('scale', d.scale),
    custom: typeof i.custom === 'string' ? (i.custom as string).slice(0, 2000) : '',
    bpmMin: num('bpmMin', d.bpmMin, 40, 220), bpmMax: num('bpmMax', d.bpmMax, 40, 220),
    seed: num('seed', d.seed, 0, 2 ** 31), progSeed: num('progSeed', d.progSeed, 0, 2 ** 31),
    lengthSec: num('lengthSec', d.lengthSec, 30, MAX_LENGTH), sectionCount: num('sectionCount', d.sectionCount, 3, 16),
    energyCurve: (['rise', 'peak-mid', 'waves', 'flat', 'fall', 'layers'].includes(i.energyCurve as string) ? i.energyCurve : d.energyCurve) as Settings['energyCurve'],
    structure: str('structure', d.structure),
    hasIntro: typeof i.hasIntro === 'boolean' ? i.hasIntro : d.hasIntro, hasOutro: typeof i.hasOutro === 'boolean' ? i.hasOutro : d.hasOutro,
    introSeconds: num('introSeconds', d.introSeconds, 0, 60), outroSeconds: num('outroSeconds', d.outroSeconds, 0, 60),
    layers: Array.isArray(i.layers) ? (i.layers as unknown[]).filter((l): l is Layer => !!l && typeof (l as Layer).name === 'string').slice(0, 16)
      .map((l) => ({ name: l.name.slice(0, 60), entry: LAYER_ENTRIES.includes(l.entry) ? l.entry : '' })) : [],
    sectionOverrides: Array.isArray(i.sectionOverrides) ? (i.sectionOverrides as unknown[]).slice(0, 18).map((x): SectionOverride => {
      const o = (x ?? {}) as Record<string, unknown>
      const sarr = (v: unknown) => (Array.isArray(v) ? (v as unknown[]).filter((y) => typeof y === 'string').slice(0, 12) as string[] : [])
      return {
        genres: sarr(o.genres), moods: sarr(o.moods),
        energy: typeof o.energy === 'number' && Number.isFinite(o.energy) ? Math.min(100, Math.max(-1, o.energy)) : -1,
      }
    }) : [],
    mode: i.mode === 'basic' ? 'basic' : 'pro',
    promptWeights: (() => {
      const w = i.promptWeights
      if (!w || typeof w !== 'object' || Array.isArray(w)) return { ...d.promptWeights }
      const out: Record<string, number> = {}
      for (const sec of PROMPT_SECTIONS) {
        const v = (w as Record<string, unknown>)[sec.id]
        if (typeof v === 'number' && Number.isFinite(v)) out[sec.id] = Math.min(2, Math.max(0, Math.round(v)))
      }
      return out
    })(),
    fillPrompt: typeof i.fillPrompt === 'boolean' ? i.fillPrompt : d.fillPrompt,
  }
}

export function generate(input: unknown) {
  const s = sanitize(input)
  return { prompt: buildPrompt(s), progression: buildProgression(s), layers: buildLayers(s), suggestedLayers: autoLayers({ ...s, layers: [] }) }
}
