'use client'

import { motion } from 'framer-motion'
import { MousePointer2, Keyboard, Sparkles, Music, Sunrise } from 'lucide-react'
import { PAINTING } from '@/lib/voyage/landmarks'

interface IntroScreenProps {
  onBegin: () => void
  ready: boolean
}

/**
 * The threshold screen. Everything is framed to fit one viewport at any
 * common size — the invitation and its button are visible without a
 * single scroll, from 4K desktops down to landscape phones.
 */
export default function IntroScreen({ onBegin, ready }: IntroScreenProps) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden overscroll-none px-6 py-[max(1.25rem,2.5dvh)]"
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ duration: 1.1, ease: [0.22, 0.8, 0.32, 1] }}
      aria-label="Introduction"
    >
      {/* scrims for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-[#070a16]/25" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-[#070a16]/85 via-[#070a16]/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#070a16]/92 via-[#070a16]/55 to-transparent" />

      {/* ——— Title block ——— */}
      <div className="relative z-10 flex shrink-0 flex-col items-center text-center fade-up">
        <p className="label-caps text-[10px] text-[#d4a94e] sm:text-xs">
          An Interactive Voyage
        </p>
        <h1 className="font-display mt-2.5 text-[clamp(2rem,5.5vw,4.8rem)] leading-[1.02] font-medium tracking-wide text-[#f6ecc8] [text-shadow:0_2px_40px_rgba(7,10,22,0.9)] [@media(max-height:560px)]:text-[clamp(1.7rem,5vw,3.2rem)]">
          The Starry
          <br />
          Expedition
        </h1>
        <div className="mt-3 flex items-center gap-4 sm:mt-4">
          <span className="gold-rule w-14 sm:w-24" />
          <Sparkles
            className="h-4 w-4 text-[#d4a94e] star-pulse"
            strokeWidth={1.5}
            aria-hidden
          />
          <span className="gold-rule w-14 sm:w-24" />
        </div>
        <p className="font-body mt-2.5 text-base italic text-[#cbc2a4] sm:text-xl">
          a cat&apos;s voyage through Van Gogh&apos;s night
        </p>
      </div>

      {/* ——— Middle block: plaque + CTA + hints ——— */}
      <div className="relative z-10 mt-[max(1rem,3dvh)] flex w-full max-w-3xl shrink-0 flex-col items-center gap-3.5 sm:gap-5">
        {/* museum plaque */}
        <div className="panel-glass w-full max-w-xl rounded-lg px-5 py-3.5 fade-up [animation-delay:150ms] sm:px-9 sm:py-5 [@media(max-height:600px)]:py-2.5">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="font-display text-base text-[#f0e8d2] sm:text-xl">
              {PAINTING.title}
            </p>
            <p className="label-caps text-[9px] text-[#d4a94e] sm:text-[10px]">
              {PAINTING.artist} · {PAINTING.date}
            </p>
            <p className="font-body hidden text-sm text-[#cbc2a4] [@media(min-height:660px)]:block">
              {PAINTING.medium} · {PAINTING.museum}
            </p>
          </div>
          <div className="gold-rule mx-auto mt-2.5 w-3/4 sm:mt-3" />
          <p className="font-body mt-2.5 hidden text-center text-[15px] leading-relaxed text-[#cbc2a4] [@media(min-height:700px)]:block">
            Six lights wait in the painted dark — the moon, Venus, the great
            swirl, the cypress, the village, the eleven stars. Sail close to
            each, and they will tell you their stories.
          </p>
          <p className="font-body mt-2 text-center text-sm text-[#cbc2a4]/90 [@media(min-height:700px)]:hidden">
            Sail close to the six golden lights — each has a story to tell.
          </p>
          {/* the two gifts of this voyage */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[#cbc2a4]/85">
            <span className="flex items-center gap-1.5">
              <Sparkles
                className="h-3.5 w-3.5 text-[#d4a94e]/80"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="font-body text-[13px]">gather the stray starlight</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sunrise
                className="h-3.5 w-3.5 text-[#d4a94e]/80"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="font-body text-[13px]">call the dawn over the same sky</span>
            </span>
          </div>
          <p className="font-body mt-2.5 flex items-center justify-center gap-2 text-center text-[13px] italic text-[#cbc2a4]/75 [@media(max-height:620px)]:hidden">
            <Music className="h-3.5 w-3.5 shrink-0 text-[#d4a94e]/80" strokeWidth={1.5} aria-hidden />
            to a solo-piano Canon in D, played live by your browser the
            moment you arrive
          </p>
        </div>

        {/* CTA — always above the fold */}
        <button
          onClick={onBegin}
          disabled={!ready}
          className="btn-ghost-gold font-display group relative shrink-0 rounded-full px-8 py-3.5 text-sm tracking-[0.18em] uppercase disabled:opacity-40 fade-up [animation-delay:300ms] sm:px-10 sm:py-4 sm:text-base"
          aria-label="Begin the voyage"
        >
          {ready ? 'Begin the Voyage' : 'Preparing the night…'}
        </button>

        {/* control hints */}
        <div className="fade-up flex shrink-0 flex-wrap items-center justify-center gap-x-8 gap-y-2 [animation-delay:450ms]">
          <span className="flex items-center gap-2.5 text-[#cbc2a4]">
            <MousePointer2 className="h-4 w-4 text-[#d4a94e]" strokeWidth={1.5} aria-hidden />
            <span className="font-body text-sm">move to steer</span>
          </span>
          <span className="hidden items-center gap-2.5 text-[#cbc2a4] sm:flex [@media(max-height:560px)]:hidden">
            <Keyboard className="h-4 w-4 text-[#d4a94e]" strokeWidth={1.5} aria-hidden />
            <span className="font-body text-sm">or WASD / arrow keys</span>
          </span>
          <span className="flex items-center gap-2.5 text-[#cbc2a4] sm:hidden">
            <span className="font-body text-sm">touch &amp; drag to sail</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}
