import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendarEvent'

export const CalendarEventsApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    api.get('/manifestation-calendar/manage', { params }).then((r) => unwrapPaginated<CalendarEvent>(r)),

  get: (id: string) =>
    api.get(`/manifestation-calendar/manage/${id}`).then((r) => unwrap<CalendarEvent>(r)),

  create: (input: CalendarEventInput) =>
    api.post('/manifestation-calendar', input).then((r) => unwrap<CalendarEvent>(r)),

  update: (id: string, input: Partial<CalendarEventInput>) =>
    api.put(`/manifestation-calendar/${id}`, input).then((r) => unwrap<CalendarEvent>(r)),

  remove: (id: string) => api.delete(`/manifestation-calendar/${id}`).then(() => undefined),
}
