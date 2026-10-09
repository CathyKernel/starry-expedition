'use client'

import { motion } from 'framer-motion'
import { RotateCcw, NotebookPen } from 'lucide-react'
import { LANDMARKS } from '@/lib/voyage/landmarks'
import type { VoyageStats } from './VoyageCanvas'

interface CompletionOverlayProps {
  stats: VoyageStats
  onSailAgain: () => void
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m > 0 ? `${m} min ${s} s` : `${s} s`
}

export default function CompletionOverlay({
  stats,
  onSailAgain,
}: CompletionOverlayProps) {
  const brushstrokes = Math.round(stats.distance / 10)
  const mix = stats.inputMix
  const mixTotal = Math.max(1, mix.pointer + mix.keys + mix.drift)
  const pct = (v: number) => Math.round((v / mixTotal) * 100)

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto overscroll-contain p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4, delay: 2.6 }}
      role="dialog"
      aria-label="Voyage complete"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070f]/40 via-[#05070f]/62 to-[#05070f]/85" />

      <motion.div
        className="relative flex w-full max-w-2xl flex-col items-center py-10 text-center"
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, delay: 2.8, ease: [0.22, 0.8, 0.32, 1] }}
      >
        <p className="label-caps text-[11px] text-[#d4a94e]">
          The constellation is complete
        </p>

        <h2 className="font-display mt-5 text-[clamp(1.9rem,4.6vw,3.4rem)] leading-tight text-[#f6ecc8] [text-shadow:0_2px_40px_rgba(7,10,22,0.9)]">
          The night is yours, little sailor.
        </h2>

        <div className="mt-6 flex items-center gap-4">
          <span className="gold-rule w-16 sm:w-28" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#d4a94e]" />
          <span className="gold-rule w-16 sm:w-28" />
        </div>

        <blockquote className="font-body mt-7 max-w-xl text-xl italic leading-relaxed text-[#e4dcc2] sm:text-[1.45rem]">
          &ldquo;For my part I know nothing with any certainty, but the sight
          of the stars makes me dream.&rdquo;
          <cite className="font-body mt-3 block text-sm not-italic tracking-wide text-[#cbc2a4]/80">
            — Vincent van Gogh, 1888
          </cite>
        </blockquote>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <div className="flex flex-col items-center">
            <p className="font-display text-2xl text-[#f0d68a] sm:text-3xl">
              {brushstrokes.toLocaleString('en-US')}
            </p>
            <p className="label-caps mt-1 text-[9px] text-[#cbc2a4]/80">
              brushstrokes sailed
            </p>
          </div>
          <div className="h-10 w-px bg-[#d4a94e]/30" />
          <div className="flex flex-col items-center">
            <p className="font-display text-2xl text-[#f0d68a] sm:text-3xl">
              {formatTime(stats.time)}
            </p>
            <p className="label-caps mt-1 text-[9px] text-[#cbc2a4]/80">
              under the stars
            </p>
          </div>
          <div className="h-10 w-px bg-[#d4a94e]/30" />
          <div className="flex flex-col items-center">
            <p className="font-display text-2xl text-[#f0d68a] sm:text-3xl">
              6 / 6
            </p>
            <p className="label-caps mt-1 text-[9px] text-[#cbc2a4]/80">
              discoveries
            </p>
          </div>
          <div className="h-10 w-px bg-[#d4a94e]/30" />
          <div className="flex flex-col items-center">
            <p className="font-display text-2xl text-[#f0d68a] sm:text-3xl">
              {stats.stardust} / {stats.stardustTotal}
            </p>
            <p className="label-caps mt-1 text-[9px] text-[#cbc2a4]/80">
              starlight gathered
            </p>
          </div>
        </div>

        {/* ——— field notes: single-session telemetry ——— */}
        <div className="panel-glass mt-10 w-full rounded-xl px-5 py-6 text-left sm:px-8">
          <div className="flex items-center gap-3">
            <NotebookPen
              className="h-4.5 w-4.5 text-[#d4a94e]"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="label-caps text-[10px] text-[#d4a94e]">
              Field notes — session telemetry
            </p>
          </div>
          <p className="font-body mt-2 text-[13.5px] italic leading-relaxed text-[#cbc2a4]/85">
            One session, logged as it was sailed. These are the measures
            defined in the design paper: time-to-discover, the order of
            finding, which hand held the tiller — and how much of the sky&apos;s
            stray light found its way aboard.
          </p>

          {/* discovery log */}
          <div className="mt-5 overflow-x-auto rounded-lg border border-[#d4a94e]/25">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#d4a94e]/25 bg-[#d4a94e]/[0.06]">
                  <th className="label-caps px-4 py-2 text-[8.5px] text-[#d4a94e]">
                    Found
                  </th>
                  <th className="label-caps px-4 py-2 text-[8.5px] text-[#d4a94e]">
                    Landmark
                  </th>
                  <th className="label-caps px-4 py-2 text-[8.5px] text-[#d4a94e]">
                    Time
                  </th>
                  <th className="label-caps px-4 py-2 text-[8.5px] text-[#d4a94e]">
                    Distance
                  </th>
                </tr>
              </thead>
              <tbody className="font-body text-[14px] leading-snug text-[#ddd5bb]">
                {stats.discoveries.map((d) => {
                  const lm = LANDMARKS.find((l) => l.id === d.id)
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-[#d4a94e]/15 last:border-0"
                    >
                      <td className="px-4 py-2.5 font-display text-[#d4a94e]">
                        {d.order}
                      </td>
                      <td className="px-4 py-2.5 text-[#f0e8d2]">
                        {lm ? lm.name : d.id}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">
                        {formatTime(d.ttd)}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">
                        {(d.distance / 10).toLocaleString('en-US')}{' '}
                        <span className="text-[#cbc2a4]/70">brushstrokes</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* input mix + revisits */}
          <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="label-caps text-[8.5px] text-[#d4a94e]/90">
                Who held the tiller
              </p>
              <div className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full border border-[#d4a94e]/25">
                <div
                  className="bg-[#d4a94e]"
                  style={{ width: `${pct(mix.pointer)}%` }}
                  title={`pointer ${pct(mix.pointer)}%`}
                />
                <div
                  className="bg-[#f0d68a]/70"
                  style={{ width: `${pct(mix.keys)}%` }}
                  title={`keys ${pct(mix.keys)}%`}
                />
                <div
                  className="bg-[#8a8264]/60"
                  style={{ width: `${pct(mix.drift)}%` }}
                  title={`drift ${pct(mix.drift)}%`}
                />
              </div>
              <p className="font-body mt-2 text-[12.5px] text-[#cbc2a4]">
                hand on the tiller {pct(mix.pointer)}% · keys{' '}
                {pct(mix.keys)}% · drifting with the current {pct(mix.drift)}%
              </p>
            </div>
            <div className="flex items-center gap-6 sm:justify-end">
              <div className="flex flex-col items-center">
                <p className="font-display text-xl text-[#f0d68a]">
                  {stats.revisits}
                </p>
                <p className="label-caps mt-0.5 text-[8.5px] text-[#cbc2a4]/80">
                  revisits
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-display text-xl text-[#f0d68a]">
                  {stats.zooms}
                </p>
                <p className="label-caps mt-0.5 text-[8.5px] text-[#cbc2a4]/80">
                  zooms
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-display text-xl text-[#f0d68a]">
                  {stats.dawnToggles}
                </p>
                <p className="label-caps mt-0.5 text-[8.5px] text-[#cbc2a4]/80">
                  dawns called
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onSailAgain}
          className="btn-ghost-gold font-display mt-10 flex items-center gap-3 rounded-full px-9 py-4 text-sm tracking-[0.2em] uppercase"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Sail again
        </button>
      </motion.div>
    </motion.div>
  )
}
