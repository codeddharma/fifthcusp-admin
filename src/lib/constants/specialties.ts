// Page/section-based specialties assignable to employees. `value` is the stored slug
// (kept in sync with the backend SPECIALTIES enum); `label` is what the admin sees.
export const USER_SPECIALTIES = [
  { value: 'home', label: 'Home/About You/Ikigai' },
  { value: 'energy_services', label: 'Energy-Basic & Advance Services' },
  { value: 'astrology_calls', label: 'Astrology-Calls/Astro Numerology' },
  { value: 'astrology_services', label: 'Astrology-Basic & Advance Services' },
  { value: 'vaastu', label: 'Vaastu' },
  { value: 'manifestation_wellbeing', label: 'Manifestation & Well-Being' },
  { value: 'tarot', label: 'Tarot' },
] as const

export type Specialty = (typeof USER_SPECIALTIES)[number]['value']

export const SPECIALTY_VALUES = USER_SPECIALTIES.map((s) => s.value) as [Specialty, ...Specialty[]]
