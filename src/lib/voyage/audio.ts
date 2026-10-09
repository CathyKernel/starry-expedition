/**
 * The Starry Expedition — soundscape.
 *
 * A solo-PIANO arrangement of Johann Pachelbel's "Canon in D" (c. 1690s,
 * public domain), synthesised live with the Web Audio API. No recordings,
 * no audio files — every note is struck by the browser.
 *
 * The piano voice is built from layered partials with a fast hammer
 * attack, register-dependent decay and a velocity-shaped lowpass — the
 * familiar "felt hammer" envelope. A light hall echo follows the beat.
 *
 * Arrangement (D major, quarter = 60 BPM, 8-bar ground):
 *   Left hand  ........ broken-chord ground: bass on the downbeat,
 *                        gentle dyads on beats 2 and 4
 *   Canon theme ....... the famous half-note line, one cycle later
 *   Second voice ...... the same line two bars behind, an octave down
 *                        (the canon device proper)
 *   Rolled arpeggios .. rising-and-falling eighths as the voyage matures
 * Discoveries and starlight chimes are harmonised with whichever chord is
 * currently sounding; completion resolves to the tonic with a D-major roll.
 *
 * Playback policy: the canon is started the moment the visitor arrives.
 * If the browser's autoplay policy holds it in suspense, the very first
 * gesture anywhere on the page (a touch, a click, a key, a wheel turn)
 * releases it — the music never waits for a dedicated "sound" button.
 */

/* ------------------------------------------------------------------ */
/* Music theory                                                        */
/* ------------------------------------------------------------------ */

const BPM = 60
const BEAT = 60 / BPM // seconds per quarter note (1.0s)
const CYCLE = 32 // beats per ground cycle (8 bars of 4/4)

/** Ground bass — one whole note per bar (frequencies in Hz) */
const BASS = [146.83, 110.0, 123.47, 92.5, 98.0, 73.42, 98.0, 110.0]

/** The famous canon theme — one half note per half bar (16 notes) */
const THEME = [
  739.99, 659.26, 587.33, 554.37, 493.88, 440.0, 493.88, 554.37, // F#5 E5 D5 C#5 B4 A4 B4 C#5
  587.33, 554.37, 493.88, 440.0, 392.0, 369.99, 392.0, 440.0, // D5 C#5 B4 A4 G4 F#4 G4 A4
]

/** Five-note chord shapes (root, 3rd, 5th, octave, 10th) for arpeggios */
const CHORD_D = [293.66, 369.99, 440.0, 587.33, 739.99]
const CHORD_A = [220.0, 277.18, 329.63, 440.0, 554.37]
const CHORD_BM = [246.94, 293.66, 369.99, 493.88, 587.33]
const CHORD_FSM = [185.0, 220.0, 277.18, 369.99, 440.0]
const CHORD_G = [196.0, 246.94, 293.66, 392.0, 493.88]

/** The eight-bar progression, one chord per bar */
const PROGRESSION = [CHORD_D, CHORD_A, CHORD_BM, CHORD_FSM, CHORD_G, CHORD_D, CHORD_G, CHORD_A]

/** Rolled-arpeggio pattern across a bar of eighth notes: up, over, down */
const ARP_PATTERN = [0, 1, 2, 3, 4, 3, 2, 1]

/* Voice entries, in beats from the start of the music */
const ENTRY_LH = 0
const ENTRY_V1 = CYCLE // theme enters with the second cycle
const ENTRY_V2 = CYCLE + 8 // second voice, two bars behind (the canon)
const ENTRY_ARP = CYCLE * 2 // rolled arpeggios join at the third cycle
const ENTRY_V3 = CYCLE * 3 // high octave shimmer joins late

const LOOKAHEAD = 2.6 // seconds of scheduling ahead of the clock
const TICK_MS = 250

const MASTER_LEVEL = 0.9

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export class Soundscape {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private comp: DynamicsCompressorNode | null = null
  private echo: DelayNode | null = null
  private pianoBus: BiquadFilterNode | null = null
  private windGain: GainNode | null = null
  private noiseNodes: Array<OscillatorNode | AudioBufferSourceNode> = []
  private timer: ReturnType<typeof setInterval> | null = null
  private running = false
  private muted = false
  private dawn = false
  private unlockBound = false
  private sparkleCount = 0

  private beatCount = 0
  private nextBeatTime = 0
  private musicStart = 0

  /**
   * Begin the canon. Called on arrival, before any gesture — if the
   * browser suspends the context, the first gesture anywhere releases it.
   * Safe to call repeatedly.
   */
  async start() {
    if (this.running) {
      await this.ctx?.resume().catch(() => {})
      this.armUnlock()
      return
    }
    try {
      const Ctor: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext
      const ctx = new Ctor()
      this.ctx = ctx
      await ctx.resume().catch(() => {})

      // —— Master: strong level, then a gentle limiter so the piano
      //    can be played loud without ever clipping ——
      const master = ctx.createGain()
      master.gain.value = this.muted ? 0 : MASTER_LEVEL
      const comp = ctx.createDynamicsCompressor()
      comp.threshold.value = -12
      comp.knee.value = 8
      comp.ratio.value = 3
      comp.attack.value = 0.004
      comp.release.value = 0.18
      master.connect(comp)
      comp.connect(ctx.destination)
      this.master = master
      this.comp = comp

      // —— Hall echo: a quarter-note sliver of room ——
      const echo = ctx.createDelay(2)
      echo.delayTime.value = BEAT // one beat of hall
      const feedback = ctx.createGain()
      feedback.gain.value = 0.22
      echo.connect(feedback)
      feedback.connect(echo)
      const wet = ctx.createGain()
      wet.gain.value = 0.16
      echo.connect(wet)
      wet.connect(master)
      this.echo = echo

      // —— Piano bus: everything struck passes the "lid" filter ——
      //    soft-focus at night, a touch brighter under the dawn
      const lid = ctx.createBiquadFilter()
      lid.type = 'lowpass'
      lid.frequency.value = this.dawn ? 5200 : 4200
      lid.Q.value = 0.4
      const lidGain = ctx.createGain()
      lidGain.gain.value = 1
      lid.connect(lidGain)
      lidGain.connect(master)
      this.pianoBus = lid

      // —— Night wind over the water (very quiet, a breath of room) ——
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5
      }
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer
      noise.loop = true
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 420
      bp.Q.value = 0.5
      const windGain = ctx.createGain()
      windGain.gain.value = this.dawn ? 0.012 : 0.022
      noise.connect(bp)
      bp.connect(windGain)
      windGain.connect(master)
      noise.start()
      const wlfo = ctx.createOscillator()
      wlfo.frequency.value = 0.07
      const wlfoGain = ctx.createGain()
      wlfoGain.gain.value = 0.01
      wlfo.connect(wlfoGain)
      wlfoGain.connect(windGain.gain)
      wlfo.start()
      this.noiseNodes.push(noise, wlfo)
      this.windGain = windGain

      // —— The canon begins ——
      this.running = true
      this.beatCount = 0
      this.nextBeatTime = ctx.currentTime + 0.25
      this.musicStart = this.nextBeatTime
      this.timer = setInterval(this.tick, TICK_MS)
      this.tick()
      this.armUnlock()
    } catch {
      // Audio unavailable — fail silently
    }
  }

  /**
   * Autoplay insurance: while the context is suspended, any gesture
   * anywhere on the page releases the music. Listeners detach
   * themselves the moment the piano is actually audible.
   */
  private armUnlock() {
    if (!this.ctx || this.unlockBound || this.ctx.state === 'running') return
    this.unlockBound = true
    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'keydown',
      'touchstart',
      'wheel',
    ]
    const release = () => {
      this.ctx
        ?.resume()
        .then(() => {
          if (!this.ctx || this.ctx.state === 'running') {
            events.forEach((ev) => window.removeEventListener(ev, release))
            this.unlockBound = false
          }
        })
        .catch(() => {})
    }
    events.forEach((ev) =>
      window.addEventListener(ev, release, { passive: true, capture: true }),
    )
  }

  /* ------------------------- scheduler ------------------------- */

  private tick = () => {
    if (!this.ctx || !this.running || !this.master) return
    if (this.ctx.state !== 'running') return // waiting for a gesture
    const now = this.ctx.currentTime
    // if the clock leapt (long suspension), re-anchor the score
    if (this.nextBeatTime < now - 1) {
      this.nextBeatTime = now + 0.15
      this.musicStart = this.nextBeatTime - this.beatCount * BEAT
    }
    while (this.nextBeatTime < now + LOOKAHEAD) {
      this.scheduleBeat(this.beatCount, this.nextBeatTime)
      this.beatCount++
      this.nextBeatTime += BEAT
    }
  }

  private scheduleBeat(b: number, t: number) {
    const bar = Math.floor((b % CYCLE) / 4)

    // — Left hand: broken-chord ground —
    if (b >= ENTRY_LH) {
      const chord = PROGRESSION[bar]
      const ramp = entryRamp(b, ENTRY_LH)
      if (b % 4 === 0) {
        // deep bass on the downbeat, allowed to ring
        this.playPiano(BASS[bar], t, BEAT * 3.6, 0.34 * ramp)
        // soft octave doubling of the root for body
        this.playPiano(BASS[bar] * 2, t + 0.012, BEAT * 2.4, 0.1 * ramp)
      } else if (b % 4 === 2) {
        // a gentle inner dyad: third + fifth
        this.playPiano(chord[1], t, BEAT * 1.8, 0.12 * ramp)
        this.playPiano(chord[2], t + 0.014, BEAT * 1.7, 0.1 * ramp)
      }
    }

    // — Canon voice 1: the theme, singing above —
    if (b >= ENTRY_V1 && (b - ENTRY_V1) % 2 === 0) {
      const idx = ((b - ENTRY_V1) / 2) % THEME.length
      const ramp = entryRamp(b, ENTRY_V1)
      this.playPiano(THEME[idx], t, BEAT * 2, 0.34 * ramp)
    }

    // — Canon voice 2: the same line two bars behind, an octave down —
    if (b >= ENTRY_V2 && (b - ENTRY_V2) % 2 === 0) {
      const idx = ((b - ENTRY_V2) / 2) % THEME.length
      const ramp = entryRamp(b, ENTRY_V2)
      this.playPiano(THEME[idx] * 0.5, t, BEAT * 2.2, 0.2 * ramp)
    }

    // — High octave shimmer, late and quiet —
    if (b >= ENTRY_V3 && (b - ENTRY_V3) % 2 === 0) {
      const idx = ((b - ENTRY_V3) / 2) % THEME.length
      const ramp = entryRamp(b, ENTRY_V3, 16)
      this.playPiano(THEME[idx] * 2, t, BEAT * 1.6, 0.06 * ramp)
    }

    // — Rolled arpeggios: eighth notes, rising and falling —
    if (b >= ENTRY_ARP) {
      const chord = PROGRESSION[bar]
      const ramp = entryRamp(b, ENTRY_ARP, 16)
      for (let k = 0; k < 2; k++) {
        const stepInBar = (b % 4) * 2 + k
        const note = chord[ARP_PATTERN[stepInBar]]
        const tt = t + k * BEAT * 0.5
        this.playPiano(note, tt, BEAT * 0.9, 0.085 * ramp)
      }
    }
  }

  /* ------------------------- the piano ------------------------- */

  /**
   * One struck note: layered partials, hammer attack, register-dependent
   * decay, and a velocity-shaped lowpass (loud notes are brighter,
   * exactly as on a real piano).
   */
  private playPiano(freq: number, t: number, dur: number, vel: number) {
    const ctx = this.ctx
    if (!ctx || !this.pianoBus) return
    if (vel <= 0.001) return
    // humanise: the hand is never a machine
    const jt = t + (Math.random() - 0.5) * 0.012
    const jv = vel * (0.92 + Math.random() * 0.16)

    // register-dependent ring: bass strings outlive treble
    const ring = Math.max(dur, 1.1 + 240 / freq)

    const g = ctx.createGain()
    g.gain.setValueAtTime(0, jt)
    g.gain.linearRampToValueAtTime(jv, jt + 0.008) // hammer
    g.gain.exponentialRampToValueAtTime(jv * 0.3, jt + 0.18) // settle
    g.gain.exponentialRampToValueAtTime(0.0001, jt + ring) // decay

    // velocity-shaped brightness
    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = clampNum(freq * 9 * (0.55 + jv * 3.2), 1400, 9500)
    tone.Q.value = 0.5
    g.connect(tone)
    tone.connect(this.pianoBus)
    if (this.echo) tone.connect(this.echo)

    // — string partials —
    const partials: Array<[OscillatorType, number, number]> = [
      ['sine', 1, 1],
      ['sine', 1.0018, 0.55], // detuned unison — two strings, slightly apart
      ['sine', 2, 0.36],
      ['triangle', 3, 0.13],
      ['sine', 4.02, 0.05],
    ]
    const oscs: OscillatorNode[] = []
    for (const [type, mult, amp] of partials) {
      const osc = ctx.createOscillator()
      osc.type = type
      osc.frequency.value = freq * mult
      const og = ctx.createGain()
      og.gain.value = amp
      osc.connect(og)
      og.connect(g)
      oscs.push(osc)
    }

    // — felt hammer thump —
    let hammer: AudioBufferSourceNode | null = null
    try {
      const hbuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.03), ctx.sampleRate)
      const hd = hbuf.getChannelData(0)
      for (let i = 0; i < hd.length; i++) {
        hd[i] = (Math.random() * 2 - 1) * (1 - i / hd.length) ** 2
      }
      hammer = ctx.createBufferSource()
      hammer.buffer = hbuf
      const hbp = ctx.createBiquadFilter()
      hbp.type = 'bandpass'
      hbp.frequency.value = clampNum(freq * 3.2, 500, 6500)
      hbp.Q.value = 0.8
      const hg = ctx.createGain()
      hg.gain.value = 0.055 * Math.min(1, jv * 2.4)
      hammer.connect(hbp)
      hbp.connect(hg)
      hg.connect(tone)
    } catch {
      hammer = null
    }

    const stop = jt + ring + 0.15
    oscs.forEach((o) => {
      o.start(jt)
      o.stop(stop)
    })
    hammer?.start(jt)
  }

  /** The chord currently sounding — flourishes harmonise with it. */
  private currentChord(): number[] {
    if (!this.ctx) return CHORD_D
    const beat = (this.ctx.currentTime - this.musicStart) / BEAT
    if (beat < 0) return CHORD_D
    const bar = Math.floor((beat % CYCLE) / 4)
    return PROGRESSION[bar]
  }

  /* ------------------------- events ------------------------- */

  /**
   * A mote of starlight is gathered: a single high chord-tone, cycling
   * through the harmony of the moment — quiet, quick, always in key.
   */
  sparkle() {
    if (!this.ctx || !this.pianoBus) return
    const chord = this.currentChord()
    const t = this.ctx.currentTime + 0.02
    const tone = chord[this.sparkleCount % 3] * 2
    this.sparkleCount++
    this.playPiano(tone, t, 1.4, 0.15)
    this.playPiano(tone * 2, t + 0.015, 0.9, 0.045)
  }

  /**
   * A landmark is discovered: the current chord, ascending, with a
   * sparkle an octave above — the flourish always belongs to the music
   * of the moment.
   */
  discovery(_index: number) {
    if (!this.ctx || !this.pianoBus) return
    const chord = this.currentChord()
    const t = this.ctx.currentTime + 0.02
    // third, fifth, octave — one octave up, quietly triumphant
    const notes = [chord[1] * 2, chord[2] * 2, chord[3] * 2]
    notes.forEach((f, i) => {
      this.playPiano(f, t + i * 0.13, 2.4, 0.2 - i * 0.03)
    })
    // a single star of sound on top
    this.playPiano(chord[4] * 2, t + 0.46, 3.0, 0.1)
  }

  /** Voyage complete: the tonic arrives — a slow D-major roll. */
  completion() {
    if (!this.ctx || !this.pianoBus) return
    const t = this.ctx.currentTime + 0.05
    // both hands find D
    this.playPiano(73.42, t, 9, 0.34)
    this.playPiano(146.83, t + 0.1, 9, 0.26)
    // the roll: D4 F#4 A4 D5 F#5 A5 D6
    const roll = [293.66, 369.99, 440.0, 587.33, 739.99, 880.0, 1174.66]
    roll.forEach((f, i) => {
      this.playPiano(f, t + 0.3 + i * 0.16, 4.6, 0.24 - i * 0.016)
    })
    // final bloom: the full triad, wide and slow
    const bloom = [587.33, 739.99, 880.0, 1174.66]
    bloom.forEach((f, i) => {
      this.playPiano(f, t + 1.6 + i * 0.07, 7.0, 0.13)
    })
  }

  /**
   * The dawn toggle: under daylight the lid opens a little — the same
   * piano, slightly brighter, and the wind settles.
   */
  setDawn(on: boolean) {
    this.dawn = on
    if (this.ctx && this.pianoBus) {
      this.pianoBus.frequency.setTargetAtTime(
        on ? 5200 : 4200,
        this.ctx.currentTime,
        0.9,
      )
    }
    if (this.ctx && this.windGain) {
      this.windGain.gain.setTargetAtTime(
        on ? 0.012 : 0.022,
        this.ctx.currentTime,
        0.9,
      )
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (this.master && this.ctx) {
      const t = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(t)
      this.master.gain.setValueAtTime(this.master.gain.value, t)
      this.master.gain.linearRampToValueAtTime(muted ? 0 : MASTER_LEVEL, t + 0.5)
    }
  }

  dispose() {
    this.running = false
    if (this.timer) clearInterval(this.timer)
    this.noiseNodes.forEach((n) => {
      try {
        n.stop()
      } catch {
        /* already stopped */
      }
    })
    this.ctx?.close().catch(() => {})
    this.ctx = null
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Smooth volume ramp as a voice enters, so arrivals feel gradual. */
function entryRamp(beat: number, entry: number, over = 8): number {
  if (beat <= entry) return 0
  const p = Math.min(1, (beat - entry) / over)
  return 0.35 + 0.65 * p
}

function clampNum(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}
