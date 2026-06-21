import { api } from './client'
import { unwrap } from './unwrap'
import type { AvailabilityWindow } from '@/types/availabilityWindow'

export interface AvailabilityWindowInput {
  dayOfWeek: number
  startHour: number
  endHour: number
  isActive?: boolean
}

export const AvailabilityWindowsApi = {
  list: () => api.get('/availability-windows').then((r) => unwrap<AvailabilityWindow[]>(r)),

  create: (input: AvailabilityWindowInput) =>
    api.post('/availability-windows', input).then((r) => unwrap<AvailabilityWindow>(r)),

  update: (id: string, input: Partial<AvailabilityWindowInput>) =>
    api.patch(`/availability-windows/${id}`, input).then((r) => unwrap<AvailabilityWindow>(r)),

  remove: (id: string) => api.delete(`/availability-windows/${id}`).then(() => undefined),
}
