'use client'

import { useEffect, useRef } from 'react'
import {
  PAINTING,
  LANDMARKS,
  BOAT,
  TWINKLE_STARS,
  VILLAGE_LIGHTS,
  STARDUST,
  type Landmark,
} from '@/lib/voyage/landmarks'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface DiscoveryRecord {
  id: string
  /** 1-based order in which the landmark was found */
  order: number
  /** time-to-discover, seconds since the voyage began */
  ttd: number
  /** distance sailed at the moment of discovery (world px) */
  distance: number
}

export interface VoyageStats {
  distance: number
  time: number
  /** per-landmark discovery log, in order of finding */
  discoveries: DiscoveryRecord[]
  /** seconds of steering by pointer, by keys, or drifting with the current */
  inputMix: { pointer: number; keys: number; drift: number }
  /** re-entries into a discovered landmark's radius */
  revisits: number
  /** discrete zoom gestures */
  zooms: number
  /** motes of starlight gathered this session */
  stardust: number
  /** total motes placed in the sky (constant) */
  stardustTotal: number
  /** day/night light-state reversions */
  dawnToggles: number
}

/** Total gatherable starlight in the sky (see STARDUST in landmarks.ts) */
export const STARDUST_TOTAL = STARDUST.length

export interface VoyageEngineAPI {
  begin: () => void
  sailAgain: () => void
  destroy: () => void
  startCompletion: () => void
  setDiscovered: (ids: string[]) => void
  setPaused: (paused: boolean) => void
  setDawn: (on: boolean) => void
}

interface EngineCallbacks {
  onDiscover: (id: string) => void
  onPhase: (phase: 'sailing' | 'complete' | 'diving') => void
  onStats: (stats: VoyageStats) => void
  onReady: () => void
  onStardust: (count: number, total: number) => void
}

interface EngineProps {
  onDiscover: (id: string) => void
  onPhase: (phase: 'sailing' | 'complete' | 'diving') => void
  onStats: (stats: VoyageStats) => void
  onReady: () => void
  onEngine: (engine: VoyageEngineAPI) => void
  onStardust: (count: number, total: number) => void
  paused: boolean
  discovered: string[]
}

interface Dab {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: [number, number, number]
  star: boolean
}

interface Wake {
  x: number
  y: number
  life: number
  maxLife: number
  size: number
  color: [number, number, number]
}

/** A gatherable mote of starlight drifting in the sky */
interface Mote {
  x: number
  y: number
  phase: number
  collected: boolean
  /** seconds since the pop animation began */
  popT: number
}
type Phase = 'idle' | 'diving' | 'sailing' | 'complete'

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const W = PAINTING.width
const H = PAINTING.height
const SWIRL = { x: 0.46 * W, y: 0.34 * H, r: 330 }

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** The celestial current — swirl + drift, in world px/s */
function flowAt(x: number, y: number): { x: number; y: number } {
  const dx = x - SWIRL.x
  const dy = y - SWIRL.y
  const r = Math.hypot(dx, dy) || 1
  const tx = -dy / r
  const ty = dx / r
  const mag = r < SWIRL.r ? r / SWIRL.r : SWIRL.r / r
  const swirlSpeed = 46 * mag
  const band = y < H * 0.66 ? 1 : 0.4
  return { x: tx * swirlSpeed + 26 * band, y: ty * swirlSpeed + 5 * band }
}

/** Van Gogh's palette for dabs, sampled from painting at spawn */
function painterlyColor(
  x: number,
  y: number,
  sampler: (x: number, y: number) => [number, number, number],
): [number, number, number] {
  const [r, g, b] = sampler(x, y)
  const lift = 52
  return [
    Math.min(255, r + lift),
    Math.min(255, g + lift * 0.85),
    Math.min(255, b + lift * 0.55),
  ]
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

class VoyageEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private painting = new Image()
  private boat = new Image()
  private sampleCanvas: HTMLCanvasElement | null = null
  private sampleData: ImageData | null = null
  private vignette: HTMLCanvasElement | null = null

  private phase: Phase = 'idle'
  private raf = 0
  private lastT = 0
  private time = 0

  private vw = 0
  private vh = 0
  private dpr = 1

  private cam = { x: W / 2, y: H / 2, zoom: 0.5 }
  private fitZoom = 0.5
  private voyageZoom = 1
  private zoomFactor = 1
  private diveT = 0
  private diveFrom = { x: W / 2, y: H / 2, zoom: 0.5 }

  private boatX = BOAT.startX * W
  private boatY = BOAT.startY * H
  private boatVX = 0
  private boatVY = 0
  private facing = -1 // 1: bow left (natural), -1: mirrored (bow right)
  private bobPhase = Math.random() * Math.PI * 2
  private wakeAcc = 0

  private pointerActive = false
  private pointerWX = 0
  private pointerWY = 0
  private pointerLastMove = 0
  private keys = new Set<string>()

  private dabs: Dab[] = []
  private wake: Wake[] = []
  private maxDabs = 96

  private discovered = new Set<string>()
  private lmGlow: Record<string, number> = {}
  private paused = false
  private reducedMotion = false

  private stats: VoyageStats = {
    distance: 0,
    time: 0,
    discoveries: [],
    inputMix: { pointer: 0, keys: 0, drift: 0 },
    revisits: 0,
    zooms: 0,
    stardust: 0,
    stardustTotal: STARDUST.length,
    dawnToggles: 0,
  }
  private statAcc = 0
  private startTime = 0
  private moved = false
  private hintAlpha = 0
  private inside = new Set<string>()
  private lastWheel = -10

  private constellationT = -1

  private motes: Mote[] = []
  /** 0 = full night … 1 = full dawn (animated toward target) */
  private dawn = 0
  private dawnTarget = 0
  private dawnCanvas: HTMLCanvasElement | null = null

  private cb: {
    onDiscover: (id: string) => void
    onPhase: (p: 'sailing' | 'complete' | 'diving') => void
    onStats: (s: VoyageStats) => void
    onReady: () => void
    onStardust: (count: number, total: number) => void
  }

  constructor(canvas: HTMLCanvasElement, cb: EngineCallbacks) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('Canvas 2D unavailable')
    this.ctx = ctx
    this.cb = cb
    this.reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (this.reducedMotion) this.maxDabs = 42

    this.painting.src = PAINTING.src
    this.boat.src = BOAT.src
    this.initMotes()
    let loaded = 0
    const done = () => {
      loaded++
      if (loaded === 2) {
        this.buildSampler()
        this.buildDawn()
        this.resize()
        this.cb.onReady()
        this.lastT = performance.now()
        this.loop(this.lastT)
      }
    }
    this.painting.onload = done
    this.boat.onload = done

    this.bindEvents()
  }

  /* ------------------------- lifecycle ------------------------- */

  destroy() {
    cancelAnimationFrame(this.raf)
    this.unbindEvents()
  }

  private bindEvents() {
    window.addEventListener('resize', this.onResize)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    this.canvas.addEventListener('pointermove', this.onPointerMove)
    this.canvas.addEventListener('pointerdown', this.onPointerDown)
    this.canvas.addEventListener('pointerleave', this.onPointerLeave)
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false })
  }

  private unbindEvents() {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave)
    this.canvas.removeEventListener('wheel', this.onWheel)
  }

  /* ------------------------- imperative API ------------------------- */

  begin() {
    this.phase = 'diving'
    this.diveT = 0
    this.diveFrom = { ...this.cam }
    this.cb.onPhase('diving')
  }

  sailAgain() {
    this.discovered.clear()
    this.lmGlow = {}
    this.constellationT = -1
    this.boatX = BOAT.startX * W
    this.boatY = BOAT.startY * H
    this.boatVX = 0
    this.boatVY = 0
    this.stats = {
      distance: 0,
      time: 0,
      discoveries: [],
      inputMix: { pointer: 0, keys: 0, drift: 0 },
      revisits: 0,
      zooms: 0,
      stardust: 0,
      stardustTotal: STARDUST.length,
      dawnToggles: 0,
    }
    this.inside.clear()
    this.lastWheel = -10
    this.moved = false
    this.hintAlpha = 0
    this.wake = []
    this.zoomFactor = 1
    this.phase = 'diving'
    this.diveT = 0
    this.diveFrom = { ...this.cam }
    this.cb.onPhase('diving')
  }

  setDiscovered(ids: string[]) {
    this.discovered = new Set(ids)
  }

  setPaused(paused: boolean) {
    this.paused = paused
  }

  /**
   * Call the dawn (or bring back the night). The light state eases over
   * ~2.5 s; every deliberate re-lighting during a voyage is logged.
   */
  setDawn(on: boolean) {
    const target = on ? 1 : 0
    if (target === this.dawnTarget) return
    this.dawnTarget = target
    if (this.phase === 'sailing' || this.phase === 'complete') {
      this.stats.dawnToggles += 1
    }
  }

  startCompletion() {
    this.constellationT = 0
    this.phase = 'complete'
    this.cb.onPhase('complete')
  }

  /* ------------------------- events ------------------------- */

  private onResize = () => {
    this.resize()
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.paused) return
    const k = e.key.toLowerCase()
    if (
      ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)
    ) {
      this.keys.add(k)
      this.moved = true
      if (e.preventDefault) e.preventDefault()
    }
  }

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase())
  }

  private onPointerDown = (e: PointerEvent) => {
    this.updatePointer(e)
    this.pointerActive = true
  }

  private onPointerMove = (e: PointerEvent) => {
    this.updatePointer(e)
    this.pointerActive = true
  }

  private onPointerLeave = () => {
    this.pointerActive = false
  }

  private onWheel = (e: WheelEvent) => {
    if (this.phase !== 'sailing') return
    e.preventDefault()
    // telemetry: one gesture per burst of wheel events
    if (this.time - this.lastWheel > 0.5) this.stats.zooms += 1
    this.lastWheel = this.time
    this.zoomFactor = clamp(
      this.zoomFactor * Math.exp(-e.deltaY * 0.0009),
      0.72,
      1.5,
    )
  }

  private updatePointer(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const wx = (sx - this.vw / 2) / this.cam.zoom + this.cam.x
    const wy = (sy - this.vh / 2) / this.cam.zoom + this.cam.y
    this.pointerWX = clamp(wx, -W * 0.05, W * 1.05)
    this.pointerWY = clamp(wy, -H * 0.05, H * 1.05)
    this.pointerLastMove = this.time
    const d = Math.hypot(wx - this.boatX, wy - this.boatY)
    if (d > 24) this.moved = true
  }

  /* ------------------------- setup ------------------------- */

  private resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    this.vw = Math.max(1, rect.width)
    this.vh = Math.max(1, rect.height)
    this.canvas.width = Math.round(this.vw * this.dpr)
    this.canvas.height = Math.round(this.vh * this.dpr)
    this.fitZoom = Math.min(this.vw / W, this.vh / H)
    this.voyageZoom = clamp(this.fitZoom * 1.9, 0.34, 1.6)
    if (this.phase === 'idle') {
      this.cam.zoom = this.fitZoom
      this.cam.x = W / 2
      this.cam.y = H / 2
    }
    this.buildVignette()
  }

  private buildSampler() {
    try {
      const c = document.createElement('canvas')
      const sw = Math.round(W / 4)
      const sh = Math.round(H / 4)
      c.width = sw
      c.height = sh
      const cx = c.getContext('2d')
      if (!cx) return
      cx.drawImage(this.painting, 0, 0, sw, sh)
      this.sampleData = cx.getImageData(0, 0, sw, sh)
      this.sampleCanvas = c
    } catch {
      this.sampleCanvas = null
    }
  }

  /**
   * The dawn plate: the same painting, re-lit once and baked — a
   * brighter exposure under a golden-hour sky, the crescent's corner
   * become a sun. Rendered as a single crossfade at draw time, so the
   * day arrives without ever touching a pixel of the night source.
   */
  private buildDawn() {
    try {
      const c = document.createElement('canvas')
      c.width = W
      c.height = H
      const cx = c.getContext('2d')
      if (!cx) return
      cx.imageSmoothingEnabled = true
      cx.imageSmoothingQuality = 'high'
      // a brighter plate (filter gracefully ignored where unsupported)
      cx.filter = 'brightness(1.16) contrast(1.03) saturate(1.06)'
      cx.drawImage(this.painting, 0, 0)
      cx.filter = 'none'
      // golden hour laid over the sky
      cx.globalCompositeOperation = 'overlay'
      const sky = cx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, 'rgba(255, 246, 222, 0.26)')
      sky.addColorStop(0.45, 'rgba(255, 224, 168, 0.36)')
      sky.addColorStop(1, 'rgba(255, 202, 130, 0.42)')
      cx.fillStyle = sky
      cx.fillRect(0, 0, W, H)
      // the sun rises where the crescent moon hangs
      cx.globalCompositeOperation = 'lighter'
      const sun = cx.createRadialGradient(
        0.879 * W,
        0.154 * H,
        30,
        0.879 * W,
        0.154 * H,
        W * 0.44,
      )
      sun.addColorStop(0, 'rgba(255, 246, 214, 0.30)')
      sun.addColorStop(0.35, 'rgba(255, 232, 178, 0.15)')
      sun.addColorStop(1, 'rgba(255, 220, 160, 0)')
      cx.fillStyle = sun
      cx.fillRect(0, 0, W, H)
      // a breath of morning haze
      cx.globalCompositeOperation = 'soft-light'
      cx.fillStyle = 'rgba(255, 238, 212, 0.5)'
      cx.fillRect(0, 0, W, H)
      cx.globalCompositeOperation = 'source-over'
      this.dawnCanvas = c
    } catch {
      this.dawnCanvas = null
    }
  }

  private initMotes() {
    this.motes = STARDUST.map((s, i) => ({
      x: s.x * W,
      y: s.y * H,
      phase: (i * 1.618) % (Math.PI * 2),
      collected: false,
      popT: 0,
    }))
  }

  private samplePaint = (x: number, y: number): [number, number, number] => {
    if (!this.sampleData) return [200, 190, 140]
    const sw = this.sampleCanvas!.width
    const sh = this.sampleCanvas!.height
    const ix = clamp(Math.round((x / W) * sw), 0, sw - 1)
    const iy = clamp(Math.round((y / H) * sh), 0, sh - 1)
    const i = (iy * sw + ix) * 4
    return [
      this.sampleData.data[i],
      this.sampleData.data[i + 1],
      this.sampleData.data[i + 2],
    ]
  }

  private buildVignette() {
    const c = document.createElement('canvas')
    c.width = Math.max(2, Math.round(this.vw))
    c.height = Math.max(2, Math.round(this.vh))
    const cx = c.getContext('2d')
    if (!cx) return
    const g = cx.createRadialGradient(
      c.width / 2,
      c.height / 2,
      Math.min(c.width, c.height) * 0.38,
      c.width / 2,
      c.height / 2,
      Math.hypot(c.width, c.height) * 0.62,
    )
    g.addColorStop(0, 'rgba(5,8,18,0)')
    g.addColorStop(0.72, 'rgba(5,8,18,0.34)')
    g.addColorStop(1, 'rgba(4,6,14,0.62)')
    cx.fillStyle = g
    cx.fillRect(0, 0, c.width, c.height)
    this.vignette = c
  }

  /* ------------------------- simulation ------------------------- */

  private spawnDab() {
    const margin = 140
    const x =
      this.cam.x + (Math.random() - 0.5) * (this.vw / this.cam.zoom + margin * 2)
    const y =
      this.cam.y + (Math.random() - 0.5) * (this.vh / this.cam.zoom + margin * 2)
    const star = Math.random() < 0.22
    const maxLife = 4 + Math.random() * 6
    this.dabs.push({
      x: clamp(x, 0, W),
      y: clamp(y, 0, H),
      vx: 0,
      vy: 0,
      life: Math.random() * maxLife,
      maxLife,
      size: star ? 1.6 + Math.random() * 2.2 : 7 + Math.random() * 15,
      color: star
        ? ([244, 232, 180] as [number, number, number])
        : painterlyColor(x, y, this.samplePaint),
      star,
    })
  }

  private updateBoat(dt: number) {
    const sailing = this.phase === 'sailing' || this.phase === 'complete'
    if (!sailing || this.paused) {
      // gentle drift only
      const f = flowAt(this.boatX, this.boatY)
      this.boatVX = lerp(this.boatVX, f.x * 0.12, 1 - Math.exp(-dt * 0.8))
      this.boatVY = lerp(this.boatVY, f.y * 0.12, 1 - Math.exp(-dt * 0.8))
      this.boatX += this.boatVX * dt
      this.boatY += this.boatVY * dt
      this.clampBoat()
      return
    }

    // desired velocity from input
    const MAX_SPEED = 265
    const ARRIVE = 130
    let dx = 0
    let dy = 0
    let hasTarget = false

    if (this.keys.size > 0) {
      let kx = 0
      let ky = 0
      if (this.keys.has('a') || this.keys.has('arrowleft')) kx -= 1
      if (this.keys.has('d') || this.keys.has('arrowright')) kx += 1
      if (this.keys.has('w') || this.keys.has('arrowup')) ky -= 1
      if (this.keys.has('s') || this.keys.has('arrowdown')) ky += 1
      if (kx || ky) {
        const n = Math.hypot(kx, ky)
        dx = (kx / n) * MAX_SPEED
        dy = (ky / n) * MAX_SPEED
        hasTarget = true
      }
    }
    if (!hasTarget && this.pointerActive && this.time - this.pointerLastMove < 6) {
      const tx = this.pointerWX - this.boatX
      const ty = this.pointerWY - this.boatY
      const d = Math.hypot(tx, ty)
      if (d > 18) {
        const speed = MAX_SPEED * clamp(d / ARRIVE, 0.22, 1)
        dx = (tx / d) * speed
        dy = (ty / d) * speed
        hasTarget = true
      }
    }

    if (hasTarget) {
      // steer toward desired
      const steerX = clamp(dx - this.boatVX, -420, 420)
      const steerY = clamp(dy - this.boatVY, -420, 420)
      this.boatVX += steerX * dt * 1.6
      this.boatVY += steerY * dt * 1.6
    } else {
      // ride the celestial current
      const f = flowAt(this.boatX, this.boatY)
      this.boatVX = lerp(this.boatVX, f.x * 0.9, 1 - Math.exp(-dt * 0.9))
      this.boatVY = lerp(this.boatVY, f.y * 0.9, 1 - Math.exp(-dt * 0.9))
    }

    // telemetry: which hand holds the tiller this frame
    if (this.keys.size > 0) this.stats.inputMix.keys += dt
    else if (hasTarget) this.stats.inputMix.pointer += dt
    else this.stats.inputMix.drift += dt

    // ambient flow nudge
    const f2 = flowAt(this.boatX, this.boatY)
    this.boatVX += f2.x * 0.1 * dt
    this.boatVY += f2.y * 0.1 * dt

    // clamp speed
    const sp = Math.hypot(this.boatVX, this.boatVY)
    if (sp > MAX_SPEED) {
      this.boatVX = (this.boatVX / sp) * MAX_SPEED
      this.boatVY = (this.boatVY / sp) * MAX_SPEED
    }

    const px = this.boatX
    const py = this.boatY
    this.boatX += this.boatVX * dt
    this.boatY += this.boatVY * dt
    this.clampBoat()
    this.stats.distance += Math.hypot(this.boatX - px, this.boatY - py)
    if (this.phase === 'sailing') this.stats.time = (this.time - this.startTime) || this.stats.time

    // facing: -1 mirrored (bow right), 1 natural (bow left)
    if (Math.abs(this.boatVX) > 26) {
      const target = this.boatVX > 0 ? -1 : 1
      this.facing = lerp(this.facing, target, 1 - Math.exp(-dt * 5))
    }

    // wake emission
    if (sp > 46) {
      this.wakeAcc += dt * sp
      if (this.wakeAcc > 42) {
        this.wakeAcc = 0
        const nx = this.boatVX / sp
        const ny = this.boatVY / sp
        this.wake.push({
          x: this.boatX - nx * 118 + (Math.random() - 0.5) * 36,
          y: this.boatY - ny * 58 + (Math.random() - 0.5) * 24,
          life: 0,
          maxLife: 1.4 + Math.random() * 0.8,
          size: 5 + Math.random() * 9,
          color: [236, 222, 168],
        })
        if (this.wake.length > 90) this.wake.shift()
      }
    }
  }

  private clampBoat() {
    const m = 84
    this.boatX = clamp(this.boatX, m, W - m)
    this.boatY = clamp(this.boatY, m, H - m)
  }

  private updateDabs(dt: number) {
    while (this.dabs.length < this.maxDabs) this.spawnDab()
    for (const d of this.dabs) {
      const f = flowAt(d.x, d.y)
      d.vx = lerp(d.vx, f.x * 1.15, 1 - Math.exp(-dt * 2))
      d.vy = lerp(d.vy, f.y * 1.15, 1 - Math.exp(-dt * 2))
      d.x += d.vx * dt
      d.y += d.vy * dt
      d.life += dt
      if (d.life > d.maxLife || d.x < -60 || d.x > W + 60 || d.y < -60 || d.y > H + 60) {
        d.life = 0
        const margin = 140
        d.x = clamp(
          this.cam.x + (Math.random() - 0.5) * (this.vw / this.cam.zoom + margin * 2),
          0,
          W,
        )
        d.y = clamp(
          this.cam.y + (Math.random() - 0.5) * (this.vh / this.cam.zoom + margin * 2),
          0,
          H,
        )
        d.color = d.star
          ? ([244, 232, 180] as [number, number, number])
          : painterlyColor(d.x, d.y, this.samplePaint)
      }
    }
    for (let i = this.wake.length - 1; i >= 0; i--) {
      const wd = this.wake[i]
      wd.life += dt
      if (wd.life > wd.maxLife) this.wake.splice(i, 1)
    }
  }

  private checkLandmarks() {
    if (this.phase !== 'sailing' || this.paused) return
    for (const lm of LANDMARKS) {
      const lx = lm.x * W
      const ly = lm.y * H
      const d = Math.hypot(this.boatX - lx, this.boatY - ly)
      const near = d < 300
      const target = near ? 1 : 0
      const cur = this.lmGlow[lm.id] ?? 0
      this.lmGlow[lm.id] = lerp(cur, target, 0.08)

      const inRadius = d < lm.radius
      const wasInside = this.inside.has(lm.id)
      if (inRadius && !wasInside) {
        this.inside.add(lm.id)
        if (!this.discovered.has(lm.id)) {
          this.discovered.add(lm.id)
          this.stats.discoveries.push({
            id: lm.id,
            order: this.stats.discoveries.length + 1,
            ttd: Math.max(0, this.time - this.startTime),
            distance: Math.round(this.stats.distance),
          })
          this.cb.onDiscover(lm.id)
        } else {
          // a deliberate return: the sailor came back to a known light
          this.stats.revisits += 1
        }
      } else if (!inRadius && wasInside) {
        this.inside.delete(lm.id)
      }
    }
  }

  /* ------------------------- starlight ------------------------- */

  /**
   * Gatherable motes: within reach they lean toward the boat (magnetic
   * acquisition), and a touch takes them — a pop of light, a chime,
   * and the count climbs. Never required, always in the way of drift.
   */
  private updateMotes(dt: number) {
    const sailing =
      (this.phase === 'sailing' || this.phase === 'complete') && !this.paused
    for (const m of this.motes) {
      if (m.collected) {
        m.popT += dt
        continue
      }
      if (!sailing) continue
      const d0 = Math.hypot(this.boatX - m.x, this.boatY - m.y)
      if (d0 < 170) {
        const pull = 1 - d0 / 170
        m.x += (this.boatX - m.x) * pull * dt * 5.5
        m.y += (this.boatY - m.y) * pull * dt * 5.5
      }
      const d = Math.hypot(this.boatX - m.x, this.boatY - m.y)
      if (d < 54) {
        m.collected = true
        m.popT = 0
        this.stats.stardust += 1
        this.cb.onStardust(this.stats.stardust, this.stats.stardustTotal)
      }
    }
  }

  /* ------------------------- rendering ------------------------- */

  private loop = (t: number) => {
    this.raf = requestAnimationFrame(this.loop)
    const dt = Math.min((t - this.lastT) / 1000, 0.05)
    this.lastT = t
    this.time += dt

    // phase transitions
    if (this.phase === 'diving') {
      this.diveT += dt
      const p = easeInOutCubic(clamp(this.diveT / 2.4, 0, 1))
      const targetZoom = this.voyageZoom * this.zoomFactor
      this.cam.zoom = lerp(this.diveFrom.zoom, targetZoom, p)
      this.cam.x = lerp(this.diveFrom.x, this.boatX, p)
      this.cam.y = lerp(this.diveFrom.y, this.boatY, p)
      if (this.diveT >= 2.4) {
        this.phase = 'sailing'
        this.startTime = this.time
        this.cb.onPhase('sailing')
      }
    } else if (this.phase === 'sailing' || this.phase === 'complete') {
      // camera follow with lookahead
      const lookX = this.boatX + clamp(this.boatVX * 0.32, -130, 130)
      const lookY = this.boatY + clamp(this.boatVY * 0.32, -130, 130)
      const targetZoom = this.voyageZoom * this.zoomFactor
      const s = 1 - Math.exp(-dt * 4.4)
      this.cam.x = lerp(this.cam.x, lookX, s)
      this.cam.y = lerp(this.cam.y, lookY, s)
      this.cam.zoom = lerp(this.cam.zoom, targetZoom, 1 - Math.exp(-dt * 6))
    } else if (this.phase === 'idle') {
      // slow ambient drift across the painting
      const px = W / 2 + Math.sin(this.time * 0.05) * W * 0.02
      const py = H / 2 + Math.cos(this.time * 0.04) * H * 0.015
      this.cam.x = lerp(this.cam.x, px, 0.02)
      this.cam.y = lerp(this.cam.y, py, 0.02)
    }

    // clamp camera to world
    const halfW = this.vw / 2 / this.cam.zoom
    const halfH = this.vh / 2 / this.cam.zoom
    this.cam.x = W < halfW * 2 ? W / 2 : clamp(this.cam.x, halfW, W - halfW)
    this.cam.y = H < halfH * 2 ? H / 2 : clamp(this.cam.y, halfH, H - halfH)

    // the dawn arrives (or the night returns) — one slow easing of light
    this.dawn = lerp(this.dawn, this.dawnTarget, 1 - Math.exp(-dt * 1.15))
    if (Math.abs(this.dawn - this.dawnTarget) < 0.002) this.dawn = this.dawnTarget

    this.updateBoat(dt)
    this.updateDabs(dt)
    this.updateMotes(dt)
    this.checkLandmarks()

    // stats callback throttle
    this.statAcc += dt
    if (this.statAcc > 0.5 && (this.phase === 'sailing' || this.phase === 'complete')) {
      this.statAcc = 0
      this.cb.onStats({
        ...this.stats,
        time: Math.max(0, this.time - this.startTime),
        discoveries: this.stats.discoveries.map((d) => ({ ...d })),
        inputMix: { ...this.stats.inputMix },
      })
    }

    // hint fade
    if (this.phase === 'sailing') {
      const wantHint = !this.moved && this.time - this.startTime > 3.5
      this.hintAlpha = lerp(this.hintAlpha, wantHint ? 1 : 0, 0.04)
    } else {
      this.hintAlpha = 0
    }

    // constellation animation
    if (this.constellationT >= 0) this.constellationT += dt

    this.render()
  }

  private render() {
    const ctx = this.ctx
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.fillStyle = '#070a16'
    ctx.fillRect(0, 0, this.vw, this.vh)

    ctx.save()
    ctx.translate(this.vw / 2, this.vh / 2)
    ctx.scale(this.cam.zoom, this.cam.zoom)
    ctx.translate(-this.cam.x, -this.cam.y)

    // painting — night, with the dawn plate laid over as one crossfade
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(this.painting, 0, 0, W, H)
    if (this.dawn > 0.01 && this.dawnCanvas) {
      ctx.globalAlpha = this.dawn
      ctx.drawImage(this.dawnCanvas, 0, 0, W, H)
      ctx.globalAlpha = 1
    }

    // how much night remains
    const night = 1 - this.dawn
    const starVis = 0.12 + 0.88 * night

    // living light: moon + venus + village glows (additive)
    // under the dawn the stars retire and the crescent becomes a sun
    ctx.globalCompositeOperation = 'lighter'
    this.drawBreathingGlow(0.879 * W, 0.154 * H, 210, [255, 214, 120], 0.02 + 0.08 * night, 0.035, 0.00013)
    if (this.dawn > 0.01) {
      this.drawBreathingGlow(
        0.879 * W,
        0.154 * H,
        320 + this.dawn * 90,
        [255, 240, 205],
        0.05 + 0.13 * this.dawn,
        0.03,
        0.00009,
      )
    }
    this.drawBreathingGlow(0.348 * W, 0.528 * H, 240, [235, 244, 220], 0.04 + 0.08 * night, 0.045, -0.00021)
    for (let i = 0; i < VILLAGE_LIGHTS.length; i++) {
      const v = VILLAGE_LIGHTS[i]
      this.drawBreathingGlow(
        v.x * W,
        v.y * H,
        34,
        [255, 196, 110],
        0.05 + 0.11 * night,
        0.06,
        0.0009 + i * 0.00021,
      )
    }

    // twinkle stars — retiring as the dawn rises
    for (let i = 0; i < TWINKLE_STARS.length; i++) {
      const s = TWINKLE_STARS[i]
      const tw = 0.5 + 0.5 * Math.sin(this.time * (0.9 + (i % 5) * 0.22) + i * 2.4)
      const alpha = (0.1 + tw * 0.3) * starVis
      if (alpha < 0.02) continue
      const r = (13 + tw * 9) * s.s
      this.glowDot(s.x * W, s.y * H, r, [250, 240, 200], alpha * 0.7)
      this.glowDot(s.x * W, s.y * H, 3 * s.s, [255, 250, 225], (0.35 + tw * 0.45) * starVis)
    }

    // flow dabs
    for (const d of this.dabs) {
      const lifeRatio = d.life / d.maxLife
      const fade = Math.sin(lifeRatio * Math.PI)
      const [r, g, b] = d.color
      if (d.star) {
        this.glowDot(d.x, d.y, d.size * 2.4, [r, g, b], (0.1 + fade * 0.28) * starVis)
      } else {
        const f = flowAt(d.x, d.y)
        const ang = Math.atan2(f.y, f.x)
        // morning light warms the brushwork itself
        const wr = Math.round(Math.min(255, r + this.dawn * 46))
        const wg = Math.round(Math.min(255, g + this.dawn * 30))
        const wb = Math.round(Math.min(255, b + this.dawn * 10))
        ctx.save()
        ctx.translate(d.x, d.y)
        ctx.rotate(ang)
        ctx.globalAlpha = fade * 0.3
        ctx.fillStyle = `rgb(${wr},${wg},${wb})`
        ctx.beginPath()
        ctx.ellipse(0, 0, d.size, d.size * 0.34, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    // stardust — the gatherable light of the night (and the morning)
    this.drawMotes()

    // landmark markers
    for (const lm of LANDMARKS) {
      this.drawLandmark(lm)
    }

    // wake (paint trail)
    ctx.globalCompositeOperation = 'lighter'
    for (const wd of this.wake) {
      const fade = 1 - wd.life / wd.maxLife
      const [r, g, b] = wd.color
      ctx.globalAlpha = fade * 0.4
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.beginPath()
      ctx.ellipse(wd.x, wd.y, wd.size * (1.2 - fade * 0.4), wd.size * 0.4, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    // constellation lines
    if (this.constellationT >= 0) this.drawConstellation()

    // the boat
    this.drawBoat()

    ctx.restore()

    // vignette — lifting a little as the morning comes
    if (this.vignette) {
      ctx.globalAlpha = 1 - this.dawn * 0.35
      ctx.drawImage(this.vignette, 0, 0, this.vw, this.vh)
      ctx.globalAlpha = 1
    }

    // wayfinding arrow (screen space)
    this.drawWayfinding()
  }

  private drawBoat() {
    const ctx = this.ctx
    const bw = 268
    const bh = (BOAT.height / BOAT.width) * bw
    const bob = Math.sin(this.time * 1.6 + this.bobPhase) * 7.2
    const bob2 = Math.cos(this.time * 1.1 + this.bobPhase) * 2.8
    const tilt = clamp(this.boatVX * 0.00085, -0.2, 0.2) + Math.sin(this.time * 1.4 + this.bobPhase) * 0.035

    // soft glow under the boat — as if lit by starlight (sunlit at dawn)
    const glowC: [number, number, number] = [
      Math.round(lerp(230, 255, this.dawn)),
      Math.round(lerp(214, 222, this.dawn)),
      Math.round(lerp(150, 152, this.dawn)),
    ]
    ctx.globalCompositeOperation = 'lighter'
    this.glowDot(this.boatX, this.boatY + bob + 34, 120, glowC, 0.1)
    ctx.globalCompositeOperation = 'source-over'

    ctx.save()
    ctx.translate(this.boatX, this.boatY + bob)
    ctx.rotate(tilt)
    const f = this.facing
    const ax = Math.abs(f) < 0.12 ? (f >= 0 ? 0.12 : -0.12) : f
    ctx.scale(ax, 1)
    ctx.drawImage(this.boat, -bw / 2, -bh / 2 + bob2 * 0.4, bw, bh)
    ctx.restore()
  }

  private drawLandmark(lm: Landmark) {
    const ctx = this.ctx
    const x = lm.x * W
    const y = lm.y * H
    const glow = this.lmGlow[lm.id] ?? 0
    const found = this.discovered.has(lm.id)

    if (found) {
      // quiet discovered state: small gold seal
      ctx.globalAlpha = 0.85
      this.glowDot(x, y, 16, [212, 169, 78], 0.35)
      ctx.strokeStyle = 'rgba(212,169,78,0.75)'
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.stroke()
      this.sparklePath(x, y, 7)
      ctx.fillStyle = '#f0d68a'
      ctx.fill()
      ctx.globalAlpha = 1
      return
    }

    const pulse = 0.5 + 0.5 * Math.sin(this.time * 1.8 + x * 0.01)

    // outer aura
    this.glowDot(x, y, 58 + pulse * 16 + glow * 26, [212, 169, 78], 0.12 + glow * 0.14)

    // rotating astrolabe arcs
    ctx.save()
    ctx.translate(x, y)
    ctx.strokeStyle = `rgba(240,214,138,${0.55 + glow * 0.35})`
    ctx.lineWidth = 1.8
    const r1 = 30
    const a0 = this.time * 0.7
    ctx.beginPath()
    ctx.arc(0, 0, r1, a0, a0 + Math.PI * 0.62)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, r1, a0 + Math.PI, a0 + Math.PI * 1.62)
    ctx.stroke()
    const r2 = 38 + pulse * 5
    ctx.strokeStyle = `rgba(212,169,78,${0.3 + glow * 0.3})`
    ctx.beginPath()
    ctx.arc(0, 0, r2, -a0 * 0.7, -a0 * 0.7 + Math.PI * 0.4)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, r2, -a0 * 0.7 + Math.PI, -a0 * 0.7 + Math.PI * 1.4)
    ctx.stroke()
    ctx.restore()

    // inner sparkle
    const s = 9 + pulse * 4 + glow * 5
    this.sparklePath(x, y, s)
    ctx.fillStyle = '#f6ecc8'
    ctx.shadowColor = 'rgba(240,214,138,0.9)'
    ctx.shadowBlur = 14
    ctx.fill()
    ctx.shadowBlur = 0

    // proximity label
    if (glow > 0.05) {
      const label = lm.name.toUpperCase()
      ctx.globalAlpha = glow
      ctx.font = '500 30px "Cormorant Garamond", Georgia, serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(246,236,200,0.96)'
      const spaced = label.split('').join('\u2009')
      ctx.fillText(spaced, x, y - 74)
      ctx.font = 'italic 400 24px "Cormorant Garamond", Georgia, serif'
      ctx.fillStyle = 'rgba(203,194,164,0.9)'
      ctx.fillText(lm.epithet, x, y - 42)
      ctx.globalAlpha = 1
    }
  }

  private sparklePath(x: number, y: number, r: number) {
    const ctx = this.ctx
    const q = r * 0.22
    ctx.beginPath()
    ctx.moveTo(x, y - r)
    ctx.quadraticCurveTo(x + q, y - q, x + r, y)
    ctx.quadraticCurveTo(x + q, y + q, x, y + r)
    ctx.quadraticCurveTo(x - q, y + q, x - r, y)
    ctx.quadraticCurveTo(x - q, y - q, x, y - r)
    ctx.closePath()
  }

  private drawConstellation() {
    const ctx = this.ctx
    const pts = LANDMARKS.map((l) => ({ x: l.x * W, y: l.y * H }))
    const LINE_DUR = 0.55
    const t = this.constellationT
    ctx.globalCompositeOperation = 'lighter'
    ctx.strokeStyle = 'rgba(240,214,138,0.75)'
    ctx.lineWidth = 2.2
    ctx.shadowColor = 'rgba(240,214,138,0.8)'
    ctx.shadowBlur = 10
    let prev: { x: number; y: number } | null = null
    for (let i = 0; i < pts.length; i++) {
      const lineT = t - i * LINE_DUR
      if (lineT <= 0) break
      const p = clamp(lineT / LINE_DUR, 0, 1)
      if (p > 0 && prev) {
        const from = prev
        const to = pts[i]
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(lerp(from.x, to.x, easeInOutCubic(p)), lerp(from.y, to.y, easeInOutCubic(p)))
        ctx.stroke()
      }
      // node burst
      if (p >= 1) {
        this.glowDot(pts[i].x, pts[i].y, 40, [240, 214, 138], 0.35)
      }
      prev = pts[i]
    }
    ctx.shadowBlur = 0
    ctx.globalCompositeOperation = 'source-over'
  }

  private drawWayfinding() {
    if (this.phase !== 'sailing' || this.paused) return
    const ctx = this.ctx
    let best: Landmark | null = null
    let bestD = Infinity
    for (const lm of LANDMARKS) {
      if (this.discovered.has(lm.id)) continue
      const d = Math.hypot(this.boatX - lm.x * W, this.boatY - lm.y * H)
      if (d < bestD) {
        bestD = d
        best = lm
      }
    }
    if (!best) return
    // convert to screen coords
    const sx = (best.x * W - this.cam.x) * this.cam.zoom + this.vw / 2
    const sy = (best.y * H - this.cam.y) * this.cam.zoom + this.vh / 2
    const m = 74
    if (sx > m && sx < this.vw - m && sy > m && sy < this.vh - m) return
    const cx = clamp(sx, m, this.vw - m)
    const cy = clamp(sy, m, this.vh - m)
    const ang = Math.atan2(sy - cy, sx - cx)
    const pulse = 0.6 + 0.4 * Math.sin(this.time * 2.4)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(ang)
    ctx.globalAlpha = 0.55 + pulse * 0.3
    ctx.strokeStyle = '#f0d68a'
    ctx.fillStyle = 'rgba(212,169,78,0.16)'
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.arc(0, 0, 15, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    // chevron pointing toward target
    ctx.beginPath()
    ctx.moveTo(4, -6)
    ctx.lineTo(11, 0)
    ctx.lineTo(4, 6)
    ctx.stroke()
    ctx.restore()
    // tiny star dot
    ctx.globalAlpha = 0.9
    this.screenSparkle(cx, cy, 5 + pulse * 2)
    ctx.globalAlpha = 1
  }

  private screenSparkle(x: number, y: number, r: number) {
    const ctx = this.ctx
    const q = r * 0.22
    ctx.fillStyle = '#f6ecc8'
    ctx.beginPath()
    ctx.moveTo(x, y - r)
    ctx.quadraticCurveTo(x + q, y - q, x + r, y)
    ctx.quadraticCurveTo(x + q, y + q, x, y + r)
    ctx.quadraticCurveTo(x - q, y + q, x - r, y)
    ctx.quadraticCurveTo(x - q, y - q, x, y - r)
    ctx.closePath()
    ctx.fill()
  }

  private glowDot(
    x: number,
    y: number,
    r: number,
    color: [number, number, number],
    alpha: number,
  ) {
    const ctx = this.ctx
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const [r0, g0, b0] = color
    g.addColorStop(0, `rgba(${r0},${g0},${b0},${alpha})`)
    g.addColorStop(1, `rgba(${r0},${g0},${b0},0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawBreathingGlow(
    x: number,
    y: number,
    r: number,
    color: [number, number, number],
    base: number,
    amp: number,
    speed: number,
  ) {
    const a = base + amp * Math.sin(this.time * speed)
    this.glowDot(x, y, r, color, Math.max(0.02, a))
  }

  /* ------------------------- stardust ------------------------- */

  private drawMotes() {
    const ctx = this.ctx
    ctx.globalCompositeOperation = 'lighter'
    for (const m of this.motes) {
      if (m.collected) {
        // the gathering pop: a ring of light rises and fades
        if (m.popT > 0.8) continue
        const p = m.popT / 0.8
        const ease = easeInOutCubic(p)
        ctx.globalAlpha = (1 - p) * 0.85
        ctx.strokeStyle = 'rgba(255, 240, 190, 1)'
        ctx.lineWidth = 2.4 * (1 - p) + 0.4
        ctx.beginPath()
        ctx.arc(m.x, m.y - ease * 26, 6 + ease * 46, 0, Math.PI * 2)
        ctx.stroke()
        this.glowDot(m.x, m.y - ease * 26, 30 * (1 - p) + 8, [255, 238, 170], 0.5 * (1 - p))
        ctx.globalAlpha = 1
        continue
      }
      const bobY = m.y + Math.sin(this.time * 1.1 + m.phase) * 5
      const tw = 0.5 + 0.5 * Math.sin(this.time * 2.1 + m.phase * 1.7)
      // night: pale starlight — dawn: warm morning sparks
      const c: [number, number, number] = [
        Math.round(lerp(255, 255, this.dawn)),
        Math.round(lerp(240, 216, this.dawn)),
        Math.round(lerp(196, 132, this.dawn)),
      ]
      this.glowDot(m.x, bobY, 22 + tw * 10, c, 0.3 + tw * 0.18)
      const sz = 7 + tw * 3
      ctx.save()
      ctx.translate(m.x, bobY)
      ctx.rotate(this.time * 0.35 + m.phase)
      this.sparklePath(0, 0, sz)
      ctx.fillStyle = `rgba(255, 248, 214, ${0.75 + tw * 0.25})`
      ctx.shadowColor = 'rgba(255, 236, 170, 0.9)'
      ctx.shadowBlur = 12
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.restore()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
}

/* ------------------------------------------------------------------ */
/* React component                                                     */
/* ------------------------------------------------------------------ */

export default function VoyageCanvas(props: EngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cbRef = useRef(props)
  const engineLocal = useRef<VoyageEngine | null>(null)

  useEffect(() => {
    cbRef.current = props
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const engine = new VoyageEngine(canvas, {
      onDiscover: (id) => cbRef.current.onDiscover(id),
      onPhase: (p) => cbRef.current.onPhase(p),
      onStats: (s) => cbRef.current.onStats(s),
      onReady: () => cbRef.current.onReady(),
      onStardust: (count, total) => cbRef.current.onStardust(count, total),
    })
    engineLocal.current = engine
    cbRef.current.onEngine(engine)
    return () => {
      engine.destroy()
      engineLocal.current = null
    }
  }, [])

  useEffect(() => {
    engineLocal.current?.setDiscovered(props.discovered)
  }, [props.discovered])

  useEffect(() => {
    engineLocal.current?.setPaused(props.paused)
  }, [props.paused])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full touch-none select-none"
      aria-label="Interactive voyage across Van Gogh's The Starry Night. Move your pointer or use WASD keys to sail; sail through the golden motes to gather starlight."
      role="img"
    />
  )
}
