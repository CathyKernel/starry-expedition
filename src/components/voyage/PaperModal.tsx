'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, BookOpen } from 'lucide-react'
import { PAINTING, asset } from '@/lib/voyage/landmarks'

interface PaperModalProps {
  onClose: () => void
}

/* ------------------------------------------------------------------ */
/* Typesetting helpers                                                 */
/* ------------------------------------------------------------------ */

function Section({
  numeral,
  title,
  children,
}: {
  numeral: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10 first:mt-8">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-sm text-[#d4a94e]">{numeral}.</span>
        <h3 className="font-display text-xl text-[#f0e8d2] sm:text-[1.35rem]">
          {title}
        </h3>
      </div>
      <div className="gold-rule mt-3 mb-4 w-full opacity-70" />
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[16px] leading-[1.72] text-[#ddd5bb] sm:text-[17px]">
      {children}
    </p>
  )
}

function Ref({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap text-[15px] text-[#d4a94e] not-italic">
      [{children}]
    </span>
  )
}

function Figure({
  src,
  n,
  caption,
  tall,
}: {
  src: string
  n: number
  caption: string
  tall?: boolean
}) {
  return (
    <figure className="my-7 flex flex-col items-center">
      <div className="overflow-hidden rounded-md border border-[#d4a94e]/30 bg-[#080b18] p-2">
        <img
          src={src}
          alt={caption}
          className={
            tall
              ? 'h-44 w-auto rounded-sm object-cover sm:h-56'
              : 'h-36 w-auto rounded-sm object-cover sm:h-48'
          }
          loading="lazy"
        />
      </div>
      <figcaption className="font-body mt-2.5 max-w-md text-center text-[13.5px] italic leading-relaxed text-[#cbc2a4]/90">
        Fig. {n}. {caption}
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Paper body                                                          */
/* ------------------------------------------------------------------ */

export default function PaperModal({ onClose }: PaperModalProps) {
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
      className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      role="dialog"
      aria-modal="true"
      aria-label="Design paper — Sailing the Starry Night"
    >
      <div
        className="absolute inset-0 bg-[#04060e]/80 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <motion.div
        className="panel-glass relative flex w-full max-w-3xl flex-col overflow-hidden rounded-xl"
        initial={{ y: 26, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 14, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.8, 0.32, 1] }}
      >
        {/* ——— masthead ——— */}
        <div className="flex items-start justify-between gap-6 border-b border-[#d4a94e]/20 px-6 py-5 sm:px-10 sm:py-6">
          <div>
            <p className="label-caps text-[10px] text-[#d4a94e]">
              An HCI design study · companion paper to the demo
            </p>
            <h2 className="font-display mt-2.5 text-[1.45rem] leading-tight text-[#f6ecc8] sm:text-[1.75rem]">
              Sailing the Starry Night: Contemplative Interaction
              Design Within a Canonical Painting
            </h2>
            <p className="font-body mt-2 text-sm italic text-[#cbc2a4]">
              The Starry Expedition — an interactive artefact, {PAINTING.date}
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4a94e]/40 bg-[#0b1020]/60 text-[#f0e8d2]/85 transition hover:border-[#d4a94e] hover:text-[#f0d68a] focus-visible:outline-2 focus-visible:outline-[#d4a94e]/70"
            aria-label="Close the paper"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* ——— body ——— */}
        <div className="scroll-slim max-h-[calc(100vh-16rem)] overflow-y-auto px-6 py-7 sm:px-10">
          {/* Abstract */}
          <div className="rounded-lg border border-[#d4a94e]/25 bg-[#d4a94e]/[0.05] px-5 py-5 sm:px-7">
            <p className="label-caps text-[10px] text-[#d4a94e]">Abstract</p>
            <p className="font-body mt-2.5 text-[15.5px] leading-[1.7] text-[#e4dcc2] sm:text-[16.5px]">
              We present <em>The Starry Expedition</em>, an interactive
              experience in which a visitor sails a wooden boat — crewed by a
              real cat — across the surface of Vincent van Gogh&rsquo;s{' '}
              <em>The Starry Night</em> (1889). The artwork remains wholly
              unaltered; every interactive property is layered above it as
              light, current, and sound. The design pursues embodied steering
              through direct manipulation, curiosity-driven discovery without
              extrinsic reward, and a tempo slow enough to invite
              contemplation. The system contributes three techniques: a
              painting-derived flow field that turns brushwork into current;
              gatherable starlight — twenty-six motes placed between the
              landmarks that reward drift rather than detours; and a
              reversible dawn that re-lights the identical pixels of the
              canvas from night into golden morning. The music is a
              live-synthesised solo-piano arrangement of Pachelbel&rsquo;s{' '}
              <em>Canon in D</em> whose flourishes harmonise with the chord
              of the moment, begun the moment the visitor arrives. We
              describe the instrumentation layer that measures exploration as
              it happens, and a protocol for a future controlled study. The
              work contributes a demonstration that a canonical painting can
              be treated as a place, not merely a picture.
            </p>
            <p className="font-body mt-3.5 text-[14px] leading-relaxed text-[#cbc2a4]">
              <span className="label-caps mr-2 text-[9px] text-[#d4a94e]/90">
                Keywords
              </span>
              direct manipulation · slow technology · exploratory learning ·
              art and HCI · ambient audio · gatherable light · day–night
              ambience · contemplative interaction
            </p>
          </div>

          <Section numeral="1" title="Introduction">
            <P>
              Museums stage masterworks behind glass and rope, and screens
              reproduce them as flat, scrollable rectangles. In both regimes
              the artwork is viewed, not inhabited: the visitor&rsquo;s body is
              still, the painting&rsquo;s space is distant, and attention
              lasts as long as the label card beside it. Interaction design
              has long offered an alternative vocabulary — direct
              manipulation <Ref>1, 2</Ref>, ambient and calm technology{' '}
              <Ref>5, 11</Ref>, learning through self-directed exploration{' '}
              <Ref>6</Ref> — yet canonical paintings are rarely given to these
              techniques whole. Where artworks are made interactive, the
              interface usually wins and the painting loses: filters,
              hotspots, and quizzes are bolted onto a diminished image.
            </P>
            <P>
              <em>The Starry Expedition</em> takes the opposite position. The
              1889 canvas is the entire world, pixel for pixel, and nothing
              on it is ever drawn over. A visitor steers a small wooden boat —
              its passenger a real cat — through the sky of the painting:
              around the great swirl, past Venus, under the crescent moon, to
              the sleeping village below. Six landmarks hold curated
              art-historical stories that reveal themselves only when the
              sailor draws near. Between the landmarks drift twenty-six motes
              of gatherable starlight, and one toggle of light calls a golden
              dawn over the same canvas — day and night as one reversible
              brushstroke. There is no score, no timer, and no diegetic UI
              chrome; the music is Johann Pachelbel&rsquo;s{' '}
              <em>Canon in D</em>, performed as a solo piano piece live by the
              browser, begun the moment the visitor arrives.
            </P>
            <P>
              This paper documents the artefact as a design study. It asks
              three questions, which the demo makes answerable by direct
              experience:
            </P>
            <ol className="font-body space-y-2.5 pl-1 text-[16px] leading-[1.65] text-[#ddd5bb]">
              <li className="flex gap-3">
                <span className="font-display shrink-0 text-[#d4a94e]">RQ1</span>
                <span>
                  Can direct-manipulation sailing convert the passive viewing
                  of a painting into embodied, spatial exploration?
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-display shrink-0 text-[#d4a94e]">RQ2</span>
                <span>
                  In the absence of score, timer, or extrinsic reward, does
                  curiosity alone sustain and shape attention?
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-display shrink-0 text-[#d4a94e]">RQ3</span>
                <span>
                  How should motion, light, and sound be layered onto an
                  unalterable masterwork so that the painting remains
                  authoritatively itself?
                </span>
              </li>
            </ol>
          </Section>

          <Section numeral="2" title="Related Work">
            <P>
              <strong className="text-[#f0e8d2]">Direct manipulation.</strong>{' '}
              Shneiderman characterised direct-manipulation interfaces by
              continuous representation of objects, physical actions on them,
              and rapid incremental feedback <Ref>1</Ref>; Hutchins, Hollan
              and Norman analysed why such interfaces feel direct — proximity,
              incrementalness, and the feeling of engagement <Ref>2</Ref>. The
              expedition applies this literally to an artwork: the boat is a
              continuously represented object inside the painting, steered by
              moving a hand, with velocity and inertia negotiated in real
              time by arrive steering <Ref>12</Ref>.
            </P>
            <P>
              <strong className="text-[#f0e8d2]">Slow and calm technology.</strong>{' '}
              Hallnäs and Redström proposed slow technology as design for
              reflection rather than efficiency, presence rather than
              immediacy <Ref>4</Ref>; Weiser and Brown argued that the most
              profound technologies disappear into the periphery and return
              only when needed <Ref>5</Ref>. The voyage has no productive goal
              and no clock: the ambient layer (drifting paint dabs, breathing
              halos, the canon) is designed to sit in the periphery, while
              discovery events — rare and unprompted — arrive as the only
              foreground interruptions.
            </P>
            <P>
              <strong className="text-[#f0e8d2]">Learning through
              exploration.</strong>{' '}
              Bruner framed discovery as the act of rearranging knowledge so
              that it connects with what a learner already knows <Ref>6</Ref>;
              Falk and Dierking&rsquo;s museum studies found that visitors
              build their own narratives from objects, place, and social
              context rather than from labels read in order <Ref>7</Ref>. The
              six landmark cards therefore behave as objects encountered in
              place — found by sailing, not by clicking a menu — and their
              facts are short, factual, and quotable rather than exhaustive.
            </P>
            <P>
              <strong className="text-[#f0e8d2]">Artworks as interfaces.</strong>{' '}
              Ambient-display research turned architectural space itself into
              an interface between people and information <Ref>11</Ref>; the
              present work treats painted space the same way, letting the
              painting&rsquo;s own structures — the swirl, the halos, the
              village lights — carry the interactive state instead of adding
              widgets. Emotional-design theory suggests that visceral,
              behavioural, and reflective levels of processing can be engaged
              by a single artefact <Ref>8</Ref>; a sailing cat is the
              artefact&rsquo;s proposal for the visceral level, and the
              quotation cards for the reflective one.
            </P>
          </Section>

          <Section numeral="3" title="Design Goals">
            <ol className="font-body space-y-3 text-[16px] leading-[1.65] text-[#ddd5bb]">
              {[
                [
                  'DG1 — The painting is sacred.',
                  'The unmodified reproduction of The Starry Night (ratio 1.25, exactly as the canvas) is the world; every interactive property is additive light, motion, or sound. No filter, overlay text, or repaint ever touches the source pixels.',
                ],
                [
                  'DG2 — Motion with weight.',
                  'The boat accelerates, coasts, leans, and rights itself; steering is a request the current may negotiate. Instant teleportation is impossible by design.',
                ],
                [
                  'DG3 — Knowledge lives in places.',
                  'Curated stories are attached to six landmarks and revealed by proximity — attention itself is the interface, in the spirit of the museum experience.',
                ],
                [
                  'DG4 — Slowness is a feature.',
                  'No score, no timer, no failure. Drift and revisiting are first-class behaviours; the wayfinding star appears only when a target is off-screen, and idleness hands the boat to the celestial current rather than pausing the world.',
                ],
                [
                  'DG5 — Coherence across the senses.',
                  'Particles sample the painting\u2019s own palette; glows breathe with the halos Van Gogh painted; the music is a single canon in D whose discovery-flourishes are harmonised to whichever chord is sounding at that moment.',
                ],
                [
                  'DG6 — Light is gatherable; time is reversible.',
                  'Twenty-six motes of starlight ride the currents between the landmarks — collecting them is never required, never scored, and always in the way of drift. And the dawn toggle re-lights the identical pixels of the canvas from night into golden morning and back, proving by reversal that every interactive layer is additive: the painting underneath remains authoritatively itself.',
                ],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#d4a94e]" />
                  <span>
                    <strong className="text-[#f0e8d2]">{title}</strong>{' '}
                    {body}
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          <Section numeral="4" title="The System">
            <P>
              <strong className="text-[#f0e8d2]">4.1 · The world.</strong>{' '}
              The world is a single 2088 × 1670 reproduction of the canvas
              (cropped to the exact 92.1 × 73.7 cm proportion and upscaled
              without retouching), rendered by a Canvas 2D engine at a
              frame-rate-independent timestep. A camera with velocity
              look-ahead follows the boat; the voyage zoom is framed so that
              the boat occupies roughly a hand&rsquo;s width of the sky, with
              wheel-zoom (0.72 × – 1.5 ×) available for detail work.
            </P>
            <Figure
              src={asset('/landmarks/swirl.jpg')}
              n={1}
              caption="The celestial current derives its whole vector field from the great swirl (detail of the world, unaltered)."
            />
            <P>
              <strong className="text-[#f0e8d2]">4.2 · The vessel.</strong>{' '}
              The sailor is a real cat — an orange tabby photographed seated
              in a vintage wooden rowboat, composited and isolated as a
              transparent sprite (Fig. 2). The sprite bobs, tilts into turns
              with lateral velocity, and mirrors when the bow swings across
              the wind. Its wake is painted with elliptical dabs of
              parchment-gold, the hue of the canvas&rsquo;s moonlight.
            </P>
            <Figure
              src={asset('/cat-boat.png')}
              n={2}
              caption="The vessel: a real cat aboard a real wooden rowboat, composited from photographs."
            />
            <P>
              <strong className="text-[#f0e8d2]">4.3 · The celestial
              current.</strong>{' '}
              A curl-based flow field is anchored on the great swirl: within
              its radius the field rotates tangentially with magnitude
              proportional to radius, outside it decays inversely, and a
              gentle westerly drift carries the whole sky. Ambient
              particles are advected by the same field and coloured by
              sampling the painting beneath them, so the motion of the air is
              visibly the painting&rsquo;s own brushwork in movement. When the
              sailor idles, the boat is handed to this current — the world
              never stops being alive.
            </P>
            <P>
              <strong className="text-[#f0e8d2]">4.4 · Living light.</strong>{' '}
              The moon, Venus, the eleven stars, and the village windows
              breathe with slow sinusoidal glows of different periods, so the
              sky never repeats itself exactly. Landmarks that are still
              undiscovered carry astrolabe-style rotating markers and
              proximity labels whose legibility grows as the boat approaches —
              wayfinding is diegetic, never a HUD menu.
            </P>
            <P>
              <strong className="text-[#f0e8d2]">4.5 · The music.</strong>{' '}
              The score is a solo-piano arrangement of Pachelbel&rsquo;s{' '}
              <em>Canon in D</em> <Ref>9</Ref> synthesised live by the Web
              Audio API at 60 BPM. The piano voice is built the way the
              instrument works: layered string partials, a felt-hammer
              transient, register-dependent decay (bass strings outlive
              treble), and a velocity-shaped lowpass so that loud notes are
              literally brighter. The left hand keeps the ground as broken
              chords; the famous theme enters one cycle later; a second
              voice follows two bars behind at the octave below (the canon
              device proper); rolled arpeggios arrive as the voyage matures.
              Every note is generated at run time — there are no audio files,
              and no two performances are sample-identical. The canon begins
              the moment the visitor arrives; where a browser&rsquo;s
              autoplay policy holds it in suspense, the first gesture
              anywhere on the page releases it. Discovery flourishes,
              starlight chimes, and the completion roll are diatonic to the
              chord sounding at that instant, so the interface&rsquo;s most
              celebratory sounds can never clash with the music the visitor
              is hearing.
            </P>
            <P>
              <strong className="text-[#f0e8d2]">4.6 · Starlight and the
              dawn.</strong>{' '}
              Twenty-six motes of starlight are hand-placed in the sky — six
              riding the rim of the great swirl, a scatter through the star
              fields, two keeping Venus company, four low over the village —
              each outside every landmark&rsquo;s discovery radius so that
              gathering never competes with finding. Within reach a mote
              leans toward the boat (magnetic acquisition); a touch takes it
              with a pop of light and a chord-tone chime. Under the dawn the
              same motes warm from pale starlight to morning sparks — the
              gathering survives the change of light. The dawn itself is a
              second, pre-baked plate of the identical reproduction — a
              brighter exposure beneath a golden-hour gradient, a sun where
              the crescent hangs — crossfaded over the night plate in ~2.5 s
              while the twinkle stars retire, the village windows dim, the
              vignette lifts, the brushwork particles warm, and the piano
              lid opens a little. Day and night are one reversible
              brushstroke laid over the canvas; nothing underneath is
              edited.
            </P>
            <Figure
              src={asset('/landmarks/moon.jpg')}
              n={3}
              caption="Proximity discovery: sailing into a landmark\u2019s halo opens its museum card (the crescent moon, detail)."
            />
          </Section>

          <Section numeral="5" title="Interaction Techniques">
            <P>
              Each technique answers a design goal, and each is grounded in
              the literature it operationalises. Table 1 summarises the
              mapping from theory to the running system.
            </P>
            <div className="overflow-x-auto rounded-lg border border-[#d4a94e]/25">
              <table className="w-full border-collapse text-left">
                <caption className="font-body px-4 py-3 text-[13.5px] italic text-[#cbc2a4]/90">
                  Table 1. Interaction techniques, their theoretical grounding,
                  and their realisation in the artefact.
                </caption>
                <thead>
                  <tr className="border-b border-[#d4a94e]/25 bg-[#d4a94e]/[0.06]">
                    <th className="label-caps px-4 py-2.5 text-[9px] text-[#d4a94e]">
                      Technique
                    </th>
                    <th className="label-caps px-4 py-2.5 text-[9px] text-[#d4a94e]">
                      Grounding
                    </th>
                    <th className="label-caps px-4 py-2.5 text-[9px] text-[#d4a94e]">
                      Realisation
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body text-[14.5px] leading-[1.55] text-[#ddd5bb]">
                  {[
                    [
                      'Pointer as tiller',
                      'Direct manipulation [1, 2]',
                      'Cursor sets a desired heading; arrive steering [12] with inertia gives the boat weight',
                    ],
                    [
                      'Keyboard parity',
                      'Access to all functions',
                      'WASD / arrows override the pointer; Escape closes every panel',
                    ],
                    [
                      'Touch steering',
                      'Modality equivalence',
                      'Touch position is a desired heading; the same physics apply',
                    ],
                    [
                      'Idle drift',
                      'Calm technology [5]',
                      'After 6 s of input silence the celestial current takes the boat',
                    ],
                    [
                      'Proximity discovery',
                      'Exploratory learning [6, 7]',
                      'Entering a landmark radius reveals its card — no click, no menu',
                    ],
                    [
                      'Wayfinding star',
                      'Legibility of vast spaces',
                      'A golden chevron appears only when the nearest unknown light is off-screen',
                    ],
                    [
                      'Wheel zoom',
                      'Overview + detail',
                      'Continuous 0.72 × – 1.5 × zoom around the voyage framing',
                    ],
                    [
                      'Starlight gathering',
                      'Intrinsic motivation — challenge & curiosity [15]',
                      '26 motes lean toward the boat within reach; each is taken by touch, with a chord-tone chime',
                    ],
                    [
                      'Dawn shift',
                      'Calm technology [5] · ambient display [11]',
                      'A reversible golden re-lighting of the same plate; stars retire, windows dim, the crescent becomes a sun',
                    ],
                    [
                      'Constellation completion',
                      'Closure',
                      'The six lights join into one constellation; the session log is offered as field notes',
                    ],
                  ].map((row) => (
                    <tr
                      key={row[0]}
                      className="border-b border-[#d4a94e]/15 last:border-0 align-top"
                    >
                      <td className="px-4 py-3 font-display text-[15px] text-[#f0e8d2]">
                        {row[0]}
                      </td>
                      <td className="px-4 py-3 text-[#cbc2a4]">{row[1]}</td>
                      <td className="px-4 py-3">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section numeral="6" title="Instrumentation and Evaluation">
            <P>
              <strong className="text-[#f0e8d2]">6.1 · Session
              telemetry.</strong>{' '}
              The engine logs exploration as it happens, and the completion
              overlay presents the log back to the sailor as field notes —
              the artefact documents its own use. Table 2 defines the
              measures collected in every session.
            </P>
            <div className="overflow-x-auto rounded-lg border border-[#d4a94e]/25">
              <table className="w-full border-collapse text-left">
                <caption className="font-body px-4 py-3 text-[13.5px] italic text-[#cbc2a4]/90">
                  Table 2. Measures recorded per session and surfaced in the
                  completion annex.
                </caption>
                <thead>
                  <tr className="border-b border-[#d4a94e]/25 bg-[#d4a94e]/[0.06]">
                    <th className="label-caps px-4 py-2.5 text-[9px] text-[#d4a94e]">
                      Measure
                    </th>
                    <th className="label-caps px-4 py-2.5 text-[9px] text-[#d4a94e]">
                      Definition
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body text-[14.5px] leading-[1.55] text-[#ddd5bb]">
                  {[
                    [
                      'Time-to-discover (TTD)',
                      'Seconds from the start of sailing until each landmark is found, per landmark and in discovery order',
                    ],
                    [
                      'Discovery order',
                      'The sequence in which the six lights are found — evidence of self-directed narrative',
                    ],
                    [
                      'Input modality mix',
                      'Seconds steered by pointer, by keys, and spent drifting with the current',
                    ],
                    [
                      'Revisits',
                      'Re-entries into an already-discovered landmark\u2019s radius — voluntary return behaviour',
                    ],
                    [
                      'Distance sailed',
                      'Path length in world pixels, reported as \u201cbrushstrokes\u201d (10 px units)',
                    ],
                    [
                      'Zoom gestures',
                      'Discrete wheel events, indicating active reframing versus passive drifting',
                    ],
                    [
                      'Starlight gathered',
                      'Motes collected out of 26 — optional engagement with the drift-space between landmarks',
                    ],
                    [
                      'Dawn toggles',
                      'Light-state reversions — deliberate re-lighting behaviour across the same canvas',
                    ],
                  ].map((row) => (
                    <tr
                      key={row[0]}
                      className="border-b border-[#d4a94e]/15 last:border-0 align-top"
                    >
                      <td className="px-4 py-3 font-display text-[15px] text-[#f0e8d2]">
                        {row[0]}
                      </td>
                      <td className="px-4 py-3">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <P>
              <strong className="text-[#f0e8d2]">6.2 · Proposed
              protocol.</strong>{' '}
              The telemetry above defines the dependent measures of a
              controlled comparison we propose as the artefact&rsquo;s next
              step. Sixteen participants would complete a
              between-subjects session in one of two conditions —{' '}
              <em>sailing</em> (this artefact) or <em>gallery</em> (a
              functionally matched pan-and-zoom viewer of the same
              reproduction with the same six cards opened by clicking
              markers) — counterbalanced for art familiarity. We would
              collect think-aloud protocols, NASA-TLX workload <Ref>13</Ref>,
              the Intrinsic Motivation Inventory interest/enjoyment subscale{' '}
              <Ref>14</Ref>, and the session telemetry itself. Three
              hypotheses: <strong>H1</strong> — sailing yields longer dwell
              time and more voluntary revisits than gallery browsing;{' '}
              <strong>H2</strong> — discovery without extrinsic reward
              reports higher intrinsic motivation; <strong>H3</strong> —
              harmonised audio-visual feedback increases perceived
              immersion. We state plainly that this is a protocol, not yet a
              completed study; the present release is a demonstration with
              single-session, self-reported evidence only.
            </P>
          </Section>

          <Section numeral="7" title="Discussion and Limitations">
            <P>
              The strongest claim this artefact can make is experiential:
              within minutes of sailing, visitors report that the painting
              has become terrain — the swirl is something to go around, the
              cypress a wind shadow to avoid, the village a place to come
              home to. That shift, from image to place, is the entire design
              thesis. Its mechanisms are deliberately conservative: nothing
              about Van Gogh&rsquo;s composition is edited, and every
              interactive layer is additive and reversible in perception
              (close the eyes and the painting is still there, whole).
            </P>
            <P>
              The limitations are equally plain. The evidence base is a
              demonstration, not an experiment; the cat, while composed of
              real photographs, is a staged composite rather than a documentary
              image; the palette-sampled particles are an evocation of
              brushwork, not a simulation of it. Canvas 2D bounds the
              rendering budget on low-end devices (the engine throttles
              particle counts and honours reduced-motion preferences, but
              cannot conjure frame rate). Motor-impaired visitors still
              depend on keyboard steering, which is parity in control but
              not in feel. And the browser&rsquo;s autoplay policy means the
              piano may begin in suspense on a cold visit — the arrangement
              is started on arrival and released by the first gesture of
              any kind, a constraint we accept as the price of silence for
              the uninvited.
            </P>
          </Section>

          <Section numeral="8" title="Future Work">
            <P>
              The immediate next step is the controlled study of §6.2. Beyond
              it, three directions beckon: co-designing the landmark
              narratives with museum educators so that the cards carry
              curatorial authority; eye-tracking during sailing, to test
              whether wayfinding light actually guides attention to the
              painted features it marks; and a series of sailable canvases —
              a small fleet of masterworks, each with its own current, its
              own cat, and its own key. The Starry Expedition is one answer
              to RQ3; the question deserves a whole gallery of them.
            </P>
          </Section>

          <Section numeral="9" title="References">
            <ol className="font-body space-y-2.5 pl-1 text-[14.5px] leading-[1.6] text-[#cbc2a4]">
              {[
                'Shneiderman, B. 1983. Direct manipulation: A step beyond programming languages. IEEE Computer 16, 8 (Aug. 1983), 57–69.',
                'Hutchins, E. L., Hollan, J. D., and Norman, D. A. 1985. Direct manipulation interfaces. Human–Computer Interaction 1, 4, 311–338.',
                'Csikszentmihalyi, M. 1990. Flow: The Psychology of Optimal Experience. Harper & Row, New York.',
                'Hallnäs, L. and Redström, J. 2001. Slow technology — designing for reflection. Personal and Ubiquitous Computing 5, 3, 201–212.',
                'Weiser, M. and Brown, J. S. 1996. The coming age of calm technology. In Beyond Calculation: The Next Fifty Years of Computing, Springer, New York, 75–85.',
                'Bruner, J. S. 1961. The act of discovery. Harvard Educational Review 31, 1, 21–32.',
                'Falk, J. H. and Dierking, L. D. 2013. The Museum Experience Revisited. Left Coast Press, Walnut Creek, CA.',
                'Norman, D. A. 2004. Emotional Design: Why We Love (or Hate) Everyday Things. Basic Books, New York.',
                'Pachelbel, J. c. 1690. Canon and Gigue in D major, for three violins and continuo. Public domain; arranged here for the Web Audio API.',
                'van Gogh, V. 1889. The Starry Night. Oil on canvas, 73.7 × 92.1 cm. The Museum of Modern Art, New York. Source: public-domain reproduction, unaltered.',
                'Wisneski, C., Ishii, H., Dahley, A., Gorbet, M., Brave, S., Ullmer, B., and Yarin, P. 1998. Ambient displays: Turning architectural space into an interface between people and digital information. In Cooperative Buildings (CoBuild \u201998), Springer, 22–32.',
                'Reynolds, C. W. 1999. Steering behaviors for autonomous characters. In Proceedings of the Game Developers Conference, 763–782.',
                'Hart, S. G. and Staveland, L. E. 1988. Development of NASA-TLX (Task Load Index): Results of empirical and theoretical research. In Advances in Psychology 52, North-Holland, 139–183.',
                'Ryan, R. M. 1982. Control and information in the intrapersonal sphere: An extension of cognitive evaluation theory. Journal of Personality and Social Psychology 43, 3, 450–461.',
                'Malone, T. W. 1981. Toward a theory of intrinsically motivating instruction. Cognitive Science 5, 4, 333–369.',
              ].map((ref, i) => (
                <li key={ref} className="flex gap-3">
                  <span className="font-display shrink-0 text-[#d4a94e]">
                    [{i + 1}]
                  </span>
                  <span>{ref}</span>
                </li>
              ))}
            </ol>
          </Section>

          <div className="gold-rule my-8 w-full" />
          <p className="font-body flex items-start gap-3 text-[14px] italic leading-relaxed text-[#cbc2a4]/90">
            <BookOpen
              className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a94e]"
              strokeWidth={1.5}
              aria-hidden
            />
            <span>
              This paper is part of the artefact itself: the demo carries its
              own documentation, written to be read between discoveries. It
              has not been peer-reviewed, and its claims of effect are
              framed as hypotheses to be tested — the sea is open.
            </span>
          </p>
        </div>

        {/* ——— footer ——— */}
        <div className="border-t border-[#d4a94e]/20 px-6 py-4 sm:px-10">
          <button
            onClick={onClose}
            className="btn-ghost-gold font-display w-full rounded-full py-3 text-sm tracking-[0.2em] uppercase"
          >
            Return to the night
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
