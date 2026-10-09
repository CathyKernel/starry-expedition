/**
 * Base path for deployments served from a sub-path (e.g. GitHub Pages
 * project sites at https://user.github.io/repo/). Injected at build time
 * via NEXT_PUBLIC_BASE_PATH; empty for root deployments.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Prefix a public/ asset path with the deployment base path. */
export const asset = (path: string) => `${BASE_PATH}${path}`

export interface LandmarkFact {
  label: string;
  text: string;
}

export interface Landmark {
  id: string;
  numeral: string;
  name: string;
  epithet: string;
  /** Position in painting-relative coordinates (0..1) */
  x: number;
  y: number;
  /** Discovery trigger radius in world px */
  radius: number;
  crop: string;
  intro: string;
  facts: LandmarkFact[];
  quote?: { text: string; source: string };
}

export const PAINTING = {
  width: 2088,
  height: 1670,
  src: asset('/starry-night.jpg'),
  title: 'The Starry Night',
  artist: 'Vincent van Gogh',
  date: 'June 1889',
  medium: 'Oil on canvas, 73.7 × 92.1 cm',
  museum: 'The Museum of Modern Art, New York',
} as const;

export const LANDMARKS: Landmark[] = [
  {
    id: 'moon',
    numeral: 'I',
    name: 'The Crescent Moon',
    epithet: 'A lantern hung at the edge of night',
    x: 0.879,
    y: 0.154,
    radius: 170,
    crop: asset('/landmarks/moon.jpg'),
    intro:
      'High in the right corner of the sky, an orange crescent burns inside a halo of concentric light. Van Gogh painted it from memory and feeling rather than from careful observation — the moon of a state of mind.',
    facts: [
      {
        label: 'A waning crescent',
        text: 'Astronomers have reconstructed the sky over Saint-Rémy in June 1889 and confirmed it: the moon really was a waning crescent, just as Van Gogh painted it.',
      },
      {
        label: 'Halos of light',
        text: 'The rings around the moon and stars were Van Gogh\u2019s own visual language — he saw light radiating, and painted energy rather than optics.',
      },
      {
        label: 'Warm against cold',
        text: 'The moon\u2019s flame-orange is the warmest point of the canvas, set against the deepest ultramarines — a contrast he sharpened deliberately in his night scenes.',
      },
    ],
    quote: {
      text: 'I absolutely want to paint a starry sky now.',
      source: 'Vincent to his brother Theo, Arles, 1888',
    },
  },
  {
    id: 'venus',
    numeral: 'II',
    name: 'Venus, the Morning Star',
    epithet: 'The brightest lantern in the sky',
    x: 0.348,
    y: 0.528,
    radius: 170,
    crop: asset('/landmarks/venus.jpg'),
    intro:
      'Below the swirl, just right of the cypress, burns the largest glow in the painting — a great white-green halo with a fierce heart. Scholars agree this is Venus, which shone with extraordinary brilliance over Provence in the spring of 1889.',
    facts: [
      {
        label: 'Really there',
        text: 'In May–June 1889 Venus was near its greatest brilliancy, low in the eastern sky before dawn — exactly where a morning star belongs.',
      },
      {
        label: 'Painted from a window',
        text: 'Van Gogh observed the night from the iron-barred window of his room in the asylum at Saint-Rémy-de-Provence, sketching the sky before dawn.',
      },
      {
        label: 'Largest light in the sky',
        text: 'Its halo is bigger and whiter than any other star\u2019s — a quiet assertion that this is the true queen of his night.',
      },
    ],
  },
  {
    id: 'swirl',
    numeral: 'III',
    name: 'The Great Swirl',
    epithet: 'The turbulent heart of the night',
    x: 0.46,
    y: 0.34,
    radius: 180,
    crop: asset('/landmarks/swirl.jpg'),
    intro:
      'Two great spirals coil across the centre of the sky — the painting\u2019s pulse. Everything in The Starry Night turns around this quiet storm, painted in short, curved, rhythmic strokes.',
    facts: [
      {
        label: 'A sky in motion',
        text: 'The swirl compresses the whole night into movement — stars, air and light spinning together in a current that never finishes.',
      },
      {
        label: 'Debated origins',
        text: 'Some historians link it to drawings of spiral nebulae published in Van Gogh\u2019s time; others to the curling of the mistral wind over the Alpilles hills.',
      },
      {
        label: 'Rhythm over likeness',
        text: 'The strokes are laid in sweeps of complementary colour — ultramarine against pale citron — creating motion the eye cannot help but follow.',
      },
    ],
  },
  {
    id: 'cypress',
    numeral: 'IV',
    name: 'The Cypress',
    epithet: 'A dark flame between earth and sky',
    x: 0.14,
    y: 0.3,
    radius: 170,
    crop: asset('/landmarks/cypress.jpg'),
    intro:
      'The cypress rises like a green-black flame from the foreground, its tip nearly touching the top of the canvas. It is the bridge between the sleeping earth and the restless sky.',
    facts: [
      {
        label: 'Beautiful as an obelisk',
        text: 'Van Gogh wrote that the cypresses were “beautiful as an Egyptian obelisk” — he found them as noble as the sunflowers he had painted before.',
      },
      {
        label: 'A tree of mourning',
        text: 'In Mediterranean tradition cypresses grow in cemeteries and stand for mourning — a silent guardian planted beside the village below.',
      },
      {
        label: 'The only true giant',
        text: 'If the sky\u2019s stars were placed at real distances, the cypress would dwarf them — Van Gogh bent scale itself to feeling.',
      },
    ],
  },
  {
    id: 'village',
    numeral: 'V',
    name: 'The Sleeping Village',
    epithet: 'Small lights under a wild heaven',
    x: 0.57,
    y: 0.72,
    radius: 170,
    crop: asset('/landmarks/village.jpg'),
    intro:
      'Beneath the commotion, a village sleeps: neat roofs, lit windows, and a slender church steeple reaching toward the swirl above. Its calm is the still point of the whole painting.',
    facts: [
      {
        label: 'A Dutch memory',
        text: 'The steeple resembles the churches of Van Gogh\u2019s native Brabant rather than Provence — a piece of home carried into the southern night.',
      },
      {
        label: 'Two kinds of light',
        text: 'The village\u2019s warm window-lights answer the cold fires of the sky: human light against cosmic light.',
      },
      {
        label: 'Steady against the storm',
        text: 'The houses are painted in calm, horizontal strokes — geometry of rest — while above them everything curves and flows.',
      },
    ],
  },
  {
    id: 'stars',
    numeral: 'VI',
    name: 'The Eleven Stars',
    epithet: 'A constellation waiting to be counted',
    x: 0.7,
    y: 0.232,
    radius: 160,
    crop: asset('/landmarks/stars.jpg'),
    intro:
      'Scattered across the ultramarine field burn eleven stars — each wrapped in its own halo of citron and white. Count them slowly; the sky rewards patience.',
    facts: [
      {
        label: 'Eleven, exactly',
        text: 'Art historians count eleven stars in the painting — a number some link to Joseph\u2019s dream in Genesis, where eleven stars bow to the twelfth.',
      },
      {
        label: 'Halos of another age',
        text: 'The rings echo the way medieval painters gilded halos — Van Gogh, the son of a pastor, gave each star its own sacred aura.',
      },
      {
        label: 'Stars as company',
        text: 'For Van Gogh the night was not empty: he called looking at the stars a way of dreaming — “why, I ask myself, shouldn\u2019t the shining dots of the sky be as accessible as the black dots on the map of France?”',
      },
    ],
    quote: {
      text: 'For my part I know nothing with any certainty, but the sight of the stars makes me dream.',
      source: 'Vincent van Gogh, 1888',
    },
  },
];

/**
 * Stardust — 26 gatherable motes of starlight, hand-placed in the sky:
 * six riding the rim of the great swirl, a scatter through the star
 * fields, two keeping Venus company, and four low over the village.
 * Positions avoid every landmark's discovery radius so gathering never
 * competes with discovery; one mote sits beside the boat's mooring so
 * the very first moment of sailing teaches the gathering gesture.
 */
export const STARDUST: Array<{ x: number; y: number }> = [
  // rim of the great swirl
  { x: 0.56, y: 0.34 },
  { x: 0.515, y: 0.4355 },
  { x: 0.405, y: 0.4355 },
  { x: 0.36, y: 0.34 },
  { x: 0.405, y: 0.2445 },
  { x: 0.515, y: 0.2445 },
  // the star fields, right sky
  { x: 0.62, y: 0.17 },
  { x: 0.75, y: 0.1 },
  { x: 0.85, y: 0.33 },
  { x: 0.93, y: 0.36 },
  { x: 0.55, y: 0.1 },
  // left sky, past the cypress
  { x: 0.08, y: 0.15 },
  { x: 0.16, y: 0.42 },
  { x: 0.27, y: 0.24 },
  { x: 0.33, y: 0.13 },
  // mid sky
  { x: 0.41, y: 0.44 },
  { x: 0.52, y: 0.47 },
  { x: 0.58, y: 0.35 },
  { x: 0.66, y: 0.5 },
  { x: 0.72, y: 0.4 }, // near the mooring — the first gift
  // keeping Venus company
  { x: 0.26, y: 0.44 },
  { x: 0.42, y: 0.62 },
  // low sky, above the sleeping village
  { x: 0.48, y: 0.63 },
  { x: 0.61, y: 0.6 },
  { x: 0.7, y: 0.6 },
  { x: 0.8, y: 0.55 },
]

export const BOAT = {
  src: asset('/cat-boat.png'),
  smallSrc: asset('/cat-boat-small.png'),
  width: 978,
  height: 516,
  /** start position (painting-relative) */
  startX: 0.75,
  startY: 0.45,
} as const;

/** Detected bright star positions (painting-relative) for twinkles */
export const TWINKLE_STARS: Array<{ x: number; y: number; s: number }> = [
  { x: 0.233, y: 0.177, s: 0.9 },
  { x: 0.328, y: 0.33, s: 0.7 },
  { x: 0.426, y: 0.199, s: 1.0 },
  { x: 0.556, y: 0.131, s: 0.8 },
  { x: 0.623, y: 0.264, s: 0.75 },
  { x: 0.71, y: 0.232, s: 1.1 },
  { x: 0.793, y: 0.128, s: 0.85 },
  { x: 0.855, y: 0.278, s: 0.7 },
  { x: 0.923, y: 0.261, s: 0.65 },
  { x: 0.922, y: 0.44, s: 0.6 },
  { x: 0.365, y: 0.512, s: 0.9 },
  { x: 0.367, y: 0.563, s: 0.8 },
  { x: 0.318, y: 0.486, s: 0.7 },
  { x: 0.314, y: 0.529, s: 0.75 },
  { x: 0.37, y: 0.535, s: 0.8 },
  { x: 0.62, y: 0.083, s: 0.7 },
  { x: 0.5, y: 0.2, s: 0.6 },
  { x: 0.28, y: 0.08, s: 0.65 },
  { x: 0.929, y: 0.477, s: 0.55 },
  { x: 0.965, y: 0.223, s: 0.7 },
  { x: 0.965, y: 0.153, s: 0.6 },
  { x: 0.928, y: 0.288, s: 0.55 },
  { x: 0.26, y: 0.42, s: 0.6 },
  { x: 0.5, y: 0.45, s: 0.65 },
];

/** Village window glows (painting-relative) */
export const VILLAGE_LIGHTS: Array<{ x: number; y: number }> = [
  { x: 0.5, y: 0.71 },
  { x: 0.545, y: 0.735 },
  { x: 0.6, y: 0.7 },
  { x: 0.625, y: 0.745 },
  { x: 0.56, y: 0.765 },
  { x: 0.475, y: 0.75 },
  { x: 0.65, y: 0.71 },
  { x: 0.53, y: 0.68 },
];
