'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Compass, Hand, Ear, Binoculars, Feather, BookOpen, Sparkles, Sunrise } from 'lucide-react'
import { PAINTING } from '@/lib/voyage/landmarks'

interface AboutModalProps {
  onClose: () => void
  onOpenPaper: () => void
}

const principles = [
  {
    icon: Compass,
    title: 'Direct manipulation',
    cite: 'Shneiderman 1983 · Hutchins et al. 1985',
    text: 'The boat obeys your pointer with weight and inertia — no buttons, no mode switches. Steering feels like sailing: you request a heading, the current negotiates.',
  },
  {
    icon: Binoculars,
    title: 'Exploratory learning',
    cite: 'Bruner 1961 · Falk & Dierking 2013',
    text: 'Knowledge is placed inside the world, not beside it. Six landmarks reward proximity with curated art-history stories — attention itself is the interface.',
  },
  {
    icon: Sparkles,
    title: 'Gatherable light',
    cite: 'Malone 1981',
    text: 'Twenty-six motes of starlight ride the currents between the landmarks, leaning toward the boat as it nears. Gathering is never required and never scored — it simply rewards drifting, the way a shell rewards a walk on the beach.',
  },
  {
    icon: Sunrise,
    title: 'The two skies',
    cite: 'Weiser & Brown 1996 · Hallnäs & Redström 2001',
    text: 'One toggle calls a golden dawn over the same canvas: the stars retire, the village windows dim, the crescent becomes a sun — and the night returns the same way. Day and night are one reversible brushstroke, proof that every layer we add is light, never paint.',
  },
  {
    icon: Ear,
    title: 'Ambient feedback',
    cite: 'Weiser & Brown 1996 · Wisneski et al. 1998',
    text: 'Breathing halos, flowing paint dabs and a live piano Canon in D keep the painting alive at every moment, signalling responsiveness without a single UI label.',
  },
  {
    icon: Feather,
    title: 'Slow interaction',
    cite: 'Hallnäs & Redström 2001',
    text: 'There is no score and no timer. The design deliberately rewards drift, detours and re-visiting — a small argument that interfaces can be contemplative.',
  },
]

export default function AboutModal({ onClose, onOpenPaper }: AboutModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      role="dialog"
      aria-modal="true"
      aria-label="About this project"
    >
      <div
        className="absolute inset-0 bg-[#05070f]/75 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <motion.div
        className="panel-glass relative flex w-full max-w-2xl flex-col overflow-hidden rounded-xl"
        initial={{ y: 26, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 14, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.8, 0.32, 1] }}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-6 border-b border-[#d4a94e]/20 px-6 py-5 sm:px-9 sm:py-6">
          <div>
            <p className="label-caps text-[10px] text-[#d4a94e]">
              About the project
            </p>
            <h2 className="font-display mt-2 text-2xl text-[#f6ecc8] sm:text-3xl">
              The Starry Expedition
            </h2>
            <p className="font-body mt-1.5 text-base italic text-[#cbc2a4]">
              an interaction-design study in one painting
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4a94e]/40 bg-[#0b1020]/60 text-[#f0e8d2]/85 transition hover:border-[#d4a94e] hover:text-[#f0d68a] focus-visible:outline-2 focus-visible:outline-[#d4a94e]/70"
            aria-label="Close about panel"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* body */}
        <div className="scroll-slim max-h-[calc(100vh-19rem)] overflow-y-auto px-6 py-6 sm:px-9">
          <p className="font-body text-[17px] leading-[1.65] text-[#e4dcc2]">
            A real cat sets sail in a real wooden boat across the surface of{' '}
            {PAINTING.artist}&rsquo;s {PAINTING.title} ({PAINTING.date}). The
            artwork is presented whole and unaltered — every swirl, star and
            cypress is exactly where Vincent left it — while a layer of light,
            current and sound is laid gently on top. The experience asks one
            question: what happens when a painting becomes a place?
          </p>

          <div className="gold-rule my-7 w-full" />

          <div className="grid gap-6 sm:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d4a94e]/40 bg-[#d4a94e]/10">
                  <p.icon
                    className="h-5 w-5 text-[#f0d68a]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
                <div>
                  <h3 className="font-display text-lg text-[#f0e8d2]">
                    {p.title}
                  </h3>
                  <p className="label-caps mt-1 text-[8.5px] text-[#d4a94e]/80">
                    {p.cite}
                  </p>
                  <p className="font-body mt-1.5 text-[15px] leading-[1.55] text-[#cbc2a4]">
                    {p.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="gold-rule my-7 w-full" />

          <div className="space-y-4">
            <div>
              <p className="label-caps text-[10px] text-[#d4a94e]/90">
                Materials
              </p>
              <p className="font-body mt-1.5 text-[16px] leading-[1.6] text-[#cbc2a4]">
                The painting is an unmodified digital reproduction of{' '}
                {PAINTING.title} ({PAINTING.medium}), {PAINTING.museum}. The
                cat and the wooden boat are real photographs, composited and
                isolated. The music is a solo-piano arrangement of Johann
                Pachelbel&rsquo;s <em>Canon in D</em> (c. 1690, public
                domain) — layered string partials, a felt-hammer transient,
                register-dependent decay — synthesised live in the browser
                with the Web Audio API, and begun the moment you arrive
                (released by your first touch wherever a browser asks for
                one). No recordings, no audio files, and every discovery
                chime and starlight spark is diatonic to the chord of the
                moment.
              </p>
            </div>
            <div>
              <p className="label-caps text-[10px] text-[#d4a94e]/90">
                Accessibility
              </p>
              <p className="font-body mt-1.5 text-[16px] leading-[1.6] text-[#cbc2a4]">
                Full keyboard sailing (WASD / arrow keys), Escape closes every
                panel, focus moves into dialogs when they open, and the
                experience respects reduced-motion preferences.
              </p>
            </div>
            <div>
              <p className="label-caps text-[10px] text-[#d4a94e]/90">
                Credits
              </p>
              <p className="font-body mt-1.5 text-[16px] leading-[1.6] text-[#cbc2a4]">
                {PAINTING.title} by {PAINTING.artist}, public domain. Built as
                an HCI design study with Next.js, Canvas 2D and Framer Motion.
                <span className="mt-1.5 flex items-center gap-2">
                  <Hand
                    className="h-4 w-4 text-[#d4a94e]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="text-sm italic">
                    No cats were seasick in the making of this voyage.
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="space-y-3 border-t border-[#d4a94e]/20 px-6 py-4 sm:px-9">
          <button
            onClick={onOpenPaper}
            className="btn-ghost-gold font-display flex w-full items-center justify-center gap-3 rounded-full py-3 text-sm tracking-[0.2em] uppercase"
          >
            <BookOpen className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Read the design paper
          </button>
          <button
            onClick={onClose}
            className="font-display w-full rounded-full py-2 text-sm tracking-[0.2em] uppercase text-[#cbc2a4]/80 transition hover:text-[#f0d68a]"
          >
            Return to the night
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
