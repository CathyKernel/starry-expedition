'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Info, RotateCcw, BookOpen, Sunrise, MoonStar } from 'lucide-react'
import { LANDMARKS } from '@/lib/voyage/landmarks'

interface HUDProps {
  visible: boolean
  discovered: string[]
  muted: boolean
  stardust: number
  stardustTotal: number
  dawn: boolean
  onToggleMute: () => void
  onToggleDawn: () => void
  onAbout: () => void
  onPaper: () => void
  onRestart: () => void
}

const iconBtn =
  'flex h-11 w-11 items-center justify-center rounded-full border border-[#d4a94e]/40 bg-[#0b1020]/55 text-[#f0e8d2]/85 backdrop-blur-md transition-all duration-200 hover:border-[#d4a94e]/90 hover:bg-[#d4a94e]/15 hover:text-[#f0d68a] focus-visible:outline-2 focus-visible:outline-[#d4a94e]/70'

export default function HUD({
  visible,
  discovered,
  muted,
  stardust,
  stardustTotal,
  dawn,
  onToggleMute,
  onToggleDawn,
  onAbout,
  onPaper,
  onRestart,
}: HUDProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          {/* ——— Top left: wordmark ——— */}
          <div className="absolute left-4 top-4 max-w-[52vw] sm:left-7 sm:top-6 sm:max-w-none">
            <p className="font-display text-[11px] leading-snug tracking-[0.14em] text-[#f0e8d2]/90 sm:text-base sm:tracking-[0.22em]">
              THE STARRY EXPEDITION
            </p>
            <div className="gold-rule mt-1.5 w-24 sm:mt-2 sm:w-40" />
            <p className="font-body mt-1 line-clamp-1 text-[11px] italic text-[#cbc2a4]/80 sm:mt-1.5 sm:text-sm">
              a voyage through Van Gogh&rsquo;s night
            </p>
          </div>

          {/* ——— Top right: controls ——— */}
          <div className="pointer-events-auto absolute right-4 top-4 flex gap-2 sm:right-7 sm:top-6 sm:gap-2.5">
            <button
              className={iconBtn}
              onClick={onToggleDawn}
              aria-label={dawn ? 'Bring back the night' : 'Call the dawn'}
              title={dawn ? 'Bring back the night' : 'Call the dawn'}
            >
              {dawn ? (
                <MoonStar className="h-[18px] w-[18px]" strokeWidth={1.5} />
              ) : (
                <Sunrise className="h-[18px] w-[18px]" strokeWidth={1.5} />
              )}
            </button>
            <button
              className={iconBtn}
              onClick={onToggleMute}
              aria-label={muted ? 'Unmute the piano' : 'Mute the piano'}
            >
              {muted ? (
                <VolumeX className="h-[18px] w-[18px]" strokeWidth={1.5} />
              ) : (
                <Volume2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
              )}
            </button>
            <button
              className={iconBtn}
              onClick={onPaper}
              aria-label="Read the design paper"
              title="Design paper"
            >
              <BookOpen className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
            <button
              className={iconBtn}
              onClick={onAbout}
              aria-label="About this project"
            >
              <Info className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
            <button
              className={iconBtn}
              onClick={onRestart}
              aria-label="Restart the voyage"
            >
              <RotateCcw className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
          </div>

          {/* ——— Bottom center: starlight + constellation progress ——— */}
          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {/* starlight gathered */}
              <div
                className="relative flex items-center gap-2.5 rounded-full border border-[#d4a94e]/25 bg-[#0b1020]/55 px-5 py-2.5 backdrop-blur-md"
                title="Starlight gathered — sail through the golden motes"
                aria-label={`${stardust} of ${stardustTotal} starlight gathered`}
              >
                <StarGlyph
                  className={`h-3.5 w-3.5 transition-colors duration-700 ${
                    stardust >= stardustTotal
                      ? 'text-[#ffe9a8]'
                      : 'text-[#d4a94e]/90'
                  }`}
                />
                <span className="font-body text-sm tabular-nums text-[#e4dcc2]">
                  {stardust}
                  <span className="text-[#cbc2a4]/70"> / {stardustTotal}</span>
                </span>
                {stardust >= stardustTotal && (
                  <span className="absolute inset-0 -m-1 rounded-full bg-[#d4a94e]/15 blur-[6px]" />
                )}
              </div>
              {/* constellation */}
              <div className="flex items-center gap-3 rounded-full border border-[#d4a94e]/25 bg-[#0b1020]/55 px-6 py-2.5 backdrop-blur-md sm:gap-4">
                {LANDMARKS.map((lm) => {
                  const found = discovered.includes(lm.id)
                  return (
                    <span
                      key={lm.id}
                      title={lm.name}
                      className="relative flex h-4 w-4 items-center justify-center"
                    >
                      <StarGlyph
                        className={`h-3.5 w-3.5 transition-colors duration-700 ${
                          found ? 'text-[#f0d68a]' : 'text-[#8a8264]'
                        }`}
                      />
                      {found && (
                        <span className="absolute inset-0 -m-1.5 rounded-full bg-[#d4a94e]/20 blur-[6px]" />
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
            <p className="font-body text-xs tracking-[0.28em] text-[#cbc2a4]/70 uppercase">
              {discovered.length} / {LANDMARKS.length} discovered · {stardust}{' '}
              / {stardustTotal} starlight
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function StarGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z" />
    </svg>
  )
}
