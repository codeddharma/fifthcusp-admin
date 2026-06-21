export const PAGE_KEYS = [
  'home',
  'astrology',
  'numerology',
  'vastu',
  'tarot',
  'energy',
  'manifestation',
  'material',
  'blogs',
  'careers',
  'about',
  'contact',
] as const

export type PageKey = (typeof PAGE_KEYS)[number]
