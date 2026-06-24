export type CalendarEventType =
  | 'grahan'
  | 'solar-eclipse'
  | 'lunar-eclipse'
  | 'full-moon'
  | 'new-moon'
  | 'festival'
  | 'other'

export interface CalendarEvent {
  _id: string
  title: string
  eventType: CalendarEventType
  date: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CalendarEventInput {
  title: string
  eventType: CalendarEventType
  date: string
  description?: string
  isActive?: boolean
}

export const EVENT_TYPE_OPTIONS: { value: CalendarEventType; label: string }[] = [
  { value: 'grahan', label: 'Grahan' },
  { value: 'solar-eclipse', label: 'Solar Eclipse' },
  { value: 'lunar-eclipse', label: 'Lunar Eclipse' },
  { value: 'full-moon', label: 'Full Moon' },
  { value: 'new-moon', label: 'New Moon' },
  { value: 'festival', label: 'Festival' },
  { value: 'other', label: 'Other' },
]

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = Object.fromEntries(
  EVENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<CalendarEventType, string>
