'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import VoyageCanvas, {
  type VoyageEngineAPI,
  type VoyageStats,
  STARDUST_TOTAL,
} from '@/components/voyage/VoyageCanvas'
import IntroScreen from '@/components/voyage/IntroScreen'
import HUD from '@/components/voyage/HUD'
import DiscoveryCard from '@/components/voyage/DiscoveryCard'
import AboutModal from '@/components/voyage/AboutModal'
import PaperModal from '@/components/voyage/PaperModal'
import CompletionOverlay from '@/components/voyage/CompletionOverlay'
import { Soundscape } from '@/lib/voyage/audio'
import { LANDMARKS, type Landmark } from '@/lib/voyage/landmarks'

type Phase = 'intro' | 'diving' | 'sailing' | 'complete'

const EMPTY_STATS: VoyageStats = {
  distance: 0,
  time: 0,
  discoveries: [],
  inputMix: { pointer: 0, keys: 0, drift: 0 },
  revisits: 0,
  zooms: 0,
  stardust: 0,
  stardustTotal: STARDUST_TOTAL,
  dawnToggles: 0,
}

export default function Page() {
  const engineRef = useRef<VoyageEngineAPI | null>(null)
  const soundRef = useRef<Soundscape | null>(null)
  const discoveredRef = useRef<string[]>([])

  const [phase, setPhase] = useState<Phase>('intro')
  const [ready, setReady] = useState(false)
  const [discovered, setDiscovered] = useState<string[]>([])
  const [activeLandmark, setActiveLandmark] = useState<Landmark | null>(null)
  const [showAbout, setShowAbout] = useState(false)
  const [showPaper, setShowPaper] = useState(false)
  const [muted, setMuted] = useState(false)
  const [stats, setStats] = useState<VoyageStats>(EMPTY_STATS)
  const [stardust, setStardust] = useState(0)
  const [dawn, setDawn] = useState(false)

  /* ——— soundscape lifecycle ——— */
  useEffect(() => {
    const sc = new Soundscape()
    soundRef.current = sc
    // The canon begins the moment the visitor arrives. Where the
    // browser's autoplay policy holds it, the first gesture anywhere
    // on the page releases it — the music never waits for a button.
    void sc.start()
    return () => {
      sc.dispose()
      soundRef.current = null
    }
  }, [])

  /* ——— engine callbacks (stable) ——— */
  const handleDiscover = useCallback((id: string) => {
    if (discoveredRef.current.includes(id)) return
    const next = [...discoveredRef.current, id]
    discoveredRef.current = next
    setDiscovered(next)
    const lm = LANDMARKS.find((l) => l.id === id)
    if (lm) setActiveLandmark(lm)
    soundRef.current?.discovery(next.length - 1)
  }, [])

  const handlePhase = useCallback((p: 'sailing' | 'complete' | 'diving') => {
    setPhase(p)
  }, [])

  const handleStats = useCallback((s: VoyageStats) => {
    setStats(s)
  }, [])

  const handleStardust = useCallback((count: number) => {
    setStardust(count)
    soundRef.current?.sparkle()
  }, [])

  const handleReady = useCallback(() => {
    setReady(true)
  }, [])

  const handleEngine = useCallback((engine: VoyageEngineAPI) => {
    engineRef.current = engine
  }, [])

  const paused = activeLandmark !== null || showAbout || showPaper

  /* ——— actions ——— */
  const beginVoyage = useCallback(() => {
    if (!ready) return
    soundRef.current?.start()
    soundRef.current?.setMuted(muted)
    engineRef.current?.begin()
    setPhase('diving')
  }, [ready, muted])

  const closeCard = useCallback(() => {
    const hadCard = activeLandmark !== null
    setActiveLandmark(null)
    if (hadCard && discoveredRef.current.length >= LANDMARKS.length) {
      // let the constellation draw itself before the overlay arrives
      window.setTimeout(() => {
        engineRef.current?.startCompletion()
        soundRef.current?.completion()
      }, 200)
    }
  }, [activeLandmark])

  const sailAgain = useCallback(() => {
    discoveredRef.current = []
    setDiscovered([])
    setActiveLandmark(null)
    setStats(EMPTY_STATS)
    setStardust(0)
    engineRef.current?.sailAgain()
    setPhase('diving')
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m
      if (!next) soundRef.current?.start()
      soundRef.current?.setMuted(next)
      return next
    })
  }, [])

  /* ——— the dawn ——— */
  const toggleDawn = useCallback(() => {
    setDawn((d) => {
      const next = !d
      engineRef.current?.setDawn(next)
      soundRef.current?.setDawn(next)
      return next
    })
  }, [])

  /* ——— escape closes overlays ——— */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeLandmark) closeCard()
        else if (showPaper) setShowPaper(false)
        else if (showAbout) setShowAbout(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeLandmark, showAbout, showPaper, closeCard])

  const showHUD = phase === 'sailing' || phase === 'complete' || phase === 'diving'

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-[#070a16]">
      {/* the living painting */}
      <VoyageCanvas
        onDiscover={handleDiscover}
        onPhase={handlePhase}
        onStats={handleStats}
        onReady={handleReady}
        onEngine={handleEngine}
        onStardust={handleStardust}
        paused={paused}
        discovered={discovered}
      />

      {/* intro */}
      <AnimatePresence>
        {phase === 'intro' && <IntroScreen onBegin={beginVoyage} ready={ready} />}
      </AnimatePresence>

      {/* HUD */}
      <HUD
        visible={showHUD && phase !== 'complete'}
        discovered={discovered}
        muted={muted}
        stardust={stardust}
        stardustTotal={STARDUST_TOTAL}
        dawn={dawn}
        onToggleMute={toggleMute}
        onToggleDawn={toggleDawn}
        onAbout={() => setShowAbout(true)}
        onPaper={() => setShowPaper(true)}
        onRestart={sailAgain}
      />

      {/* early sailing hint */}
      <AnimatePresence>
        {phase === 'sailing' && discovered.length === 0 && stats.time < 9 && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-24 z-10 flex justify-center px-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <p className="font-body rounded-full border border-[#d4a94e]/30 bg-[#0b1020]/80 px-6 py-2.5 text-center text-sm text-[#e4dcc2] backdrop-blur-md sm:text-base">
              Sail toward a golden light — it has a story to tell.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* discovery card */}
      <AnimatePresence>
        {activeLandmark && (
          <DiscoveryCard
            key={activeLandmark.id}
            landmark={activeLandmark}
            index={discovered.indexOf(activeLandmark.id) + 1}
            total={LANDMARKS.length}
            onClose={closeCard}
          />
        )}
      </AnimatePresence>

      {/* about */}
      <AnimatePresence>
        {showAbout && (
          <AboutModal
            onClose={() => setShowAbout(false)}
            onOpenPaper={() => {
              setShowAbout(false)
              setShowPaper(true)
            }}
          />
        )}
      </AnimatePresence>

      {/* the design paper */}
      <AnimatePresence>
        {showPaper && <PaperModal onClose={() => setShowPaper(false)} />}
      </AnimatePresence>

      {/* completion */}
      <AnimatePresence>
        {phase === 'complete' && (
          <CompletionOverlay stats={stats} onSailAgain={sailAgain} />
        )}
      </AnimatePresence>

      {/* screen-reader description */}
      <p className="sr-only">
        The Starry Expedition is an interactive art experience and HCI design
        study. A real cat in a wooden boat sails across Vincent van Gogh&apos;s
        painting The Starry Night. Steer with a pointer, touch, or the WASD
        and arrow keys. Six golden landmarks — the crescent moon, Venus, the
        great swirl, the cypress, the sleeping village and the eleven stars
        — reveal curated stories when you sail near them. Twenty-six motes of
        gatherable starlight drift between the landmarks, and one toggle of
        light calls a golden dawn — or brings back the night — over the same
        canvas. The music is a solo-piano arrangement of Pachelbel&apos;s
        Canon in D, synthesised live in the browser and begun the moment
        you arrive. A companion design paper and a session telemetry annex
        are available from the toolbar.
      </p>
    </main>
  )
}
