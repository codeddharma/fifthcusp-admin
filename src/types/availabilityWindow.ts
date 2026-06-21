export interface AvailabilityWindow {
  _id: string
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  startHour: number
  endHour: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
