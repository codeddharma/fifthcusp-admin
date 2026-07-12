export const PAGE_KEYS = [
  'home',
  'astrology',
  'vastu',
  'tarot-reading',
  'energy',
  'manifestation',
  'wealth',
  'blogs',
  'careers',
  'about',
  'contact',
] as const

export type PageKey = (typeof PAGE_KEYS)[number]
