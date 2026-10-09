'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Landmark } from '@/lib/voyage/landmarks'

interface DiscoveryCardProps {
  landmark: Landmark
  index: number
  total: number
  onClose: () => void
}

export default function DiscoveryCard({
  landmark,
  index,
  total,
  onClose,
}: DiscoveryCardProps) {
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
      transition={{ duration: 0.45 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Discovery: ${landmark.name}`}
    >
      {/* scrim */}
      <div
        className="absolute inset-0 bg-[#05070f]/72 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <motion.div
        className="panel-glass relative w-full max-w-lg overflow-hidden rounded-xl"
        initial={{ y: 34, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 18, scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 0.8, 0.32, 1] }}
      >
        {/* ——— painting crop ——— */}
        <div className="relative h-52 sm:h-60">
          
          <img
            src={landmark.crop}
            alt={`Detail of Van Gogh's The Starry Night: ${landmark.name}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020] via-transparent to-transparent" />
          <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-[#d4a94e]/60 bg-[#0b1020]/70 backdrop-blur-sm">
            <span className="font-display text-lg text-[#f0d68a]">
              {landmark.numeral}
            </span>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#d4a94e]/40 bg-[#0b1020]/60 text-[#f0e8d2]/85 backdrop-blur-sm transition hover:border-[#d4a94e] hover:text-[#f0d68a] focus-visible:outline-2 focus-visible:outline-[#d4a94e]/70"
            aria-label="Close discovery"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* ——— body ——— */}
        <div className="scroll-slim max-h-[calc(100vh-21rem)] overflow-y-auto px-6 pb-6 pt-2 sm:px-9 sm:pb-8">
          <p className="label-caps text-[10px] text-[#d4a94e]">
            Landmark Discovered · {index} of {total}
          </p>
          <h2 className="font-display mt-2.5 text-2xl text-[#f6ecc8] sm:text-[2rem]">
            {landmark.name}
          </h2>
          <p className="font-body mt-1 text-base italic text-[#cbc2a4]">
            {landmark.epithet}
          </p>
          <div className="gold-rule my-5 w-full" />

          <p className="font-body text-[17px] leading-[1.65] text-[#e4dcc2]">
            {landmark.intro}
          </p>

          <ul className="mt-6 space-y-5">
            {landmark.facts.map((fact) => (
              <li key={fact.label} className="flex gap-4">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-[#d4a94e]" />
                <div>
                  <p className="label-caps text-[10px] text-[#d4a94e]/90">
                    {fact.label}
                  </p>
                  <p className="font-body mt-1 text-[16px] leading-[1.55] text-[#cbc2a4]">
                    {fact.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {landmark.quote && (
            <blockquote className="mt-7 border-l-2 border-[#d4a94e]/50 pl-5">
              <p className="font-body text-lg italic leading-relaxed text-[#f0e8d2]">
                &ldquo;{landmark.quote.text}&rdquo;
              </p>
              <cite className="font-body mt-2 block text-sm not-italic text-[#cbc2a4]/75">
                — {landmark.quote.source}
              </cite>
            </blockquote>
          )}
        </div>

        {/* ——— footer ——— */}
        <div className="border-t border-[#d4a94e]/20 px-6 py-4 sm:px-9">
          <button
            onClick={onClose}
            className="btn-ghost-gold font-display w-full rounded-full py-3 text-sm tracking-[0.2em] uppercase"
          >
            Continue the voyage
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
