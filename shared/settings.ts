export interface Layer { name: string; entry: string }

/** Per-section control: which selected genres/moods lead this section and how intense it is (0–100, -1 = auto). */
export interface SectionOverride { genres: string[]; moods: string[]; energy: number }

export interface Settings {
  genres: string[]
  instruments: string[]
  moods: string[]
  progression: string
  vocals: string
  arrangement: string
  era: string
  production: string[]
  bpmMin: number
  bpmMax: number
  key: string
  scale: string
  custom: string
  seed: number
  progSeed: number
  lengthSec: number
  sectionCount: number
  energyCurve: 'rise' | 'peak-mid' | 'waves' | 'flat' | 'fall' | 'layers'
  structure: string
  hasIntro: boolean
  hasOutro: boolean
  introSeconds: number
  outroSeconds: number
  layers: Layer[]
  sectionOverrides: SectionOverride[]
  mode: 'basic' | 'pro'
  /** Per-section prompt detail weight: 2 = detailed wording first, 1 = normal, 0 = always stays short. */
  promptWeights: Record<string, number>
  /** Fill the prompt with detailed wording up to MAX_PROMPT; off keeps every section short. */
  fillPrompt: boolean
}

/** Prompt sections whose wording can be prioritised when filling the character budget. */
export const PROMPT_SECTIONS: { id: string; label: string }[] = [
  { id: 'genres', label: 'Genres' },
  { id: 'moods', label: 'Mood' },
  { id: 'instruments', label: 'Instruments' },
  { id: 'arrangement', label: 'Arrangement' },
  { id: 'vocals', label: 'Vocals' },
  { id: 'progression', label: 'Progression style' },
  { id: 'era', label: 'Era' },
  { id: 'production', label: 'Production' },
  { id: 'extras', label: 'Polish details (hooks, transitions, ending…)' },
]

export const DEFAULT_SETTINGS: Settings = {
  genres: [], instruments: [], moods: [], progression: 'build', vocals: 'none', arrangement: 'full', era: 'none',
  production: [], bpmMin: 110, bpmMax: 130, key: 'Any', scale: 'minor', custom: '', seed: 1, progSeed: 1,
  lengthSec: 180, sectionCount: 6, energyCurve: 'rise', structure: 'auto',
  hasIntro: true, hasOutro: true, introSeconds: 15, outroSeconds: 15, layers: [],
  sectionOverrides: [], mode: 'basic',
  promptWeights: { genres: 2, moods: 2, instruments: 2 },
  fillPrompt: false,
}

export const MAX_PROMPT = 1000
export const MAX_LENGTH = 360
export const LAYER_ENTRIES = ['fade in', 'hard cut in', 'filter opens', 'swells in', 'riser into it', 'drops in on the one', 'sidechained in', 'stutter in']
export const STRUCTURES = ['auto', 'edm', 'trance', 'techno', 'bass', 'hard', 'song', 'hiphop', 'rock', 'metal', 'jazz', 'folk', 'world', 'ambient', 'instrumental']
export const ENERGY_CURVES = ['rise', 'peak-mid', 'waves', 'flat', 'fall', 'layers'] as const

export const newSeed = () => Math.floor(Math.random() * 2 ** 31)

export interface Generated { prompt: string; progression: string[]; layers: string[]; suggestedLayers: string[] }
