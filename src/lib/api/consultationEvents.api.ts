import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { ConsultationEvent, ConsultationEventFilters } from '@/types/consultationEvent'

export const ConsultationEventsApi = {
  list: (filters: ConsultationEventFilters = {}) =>
    api.get('/consultation-events', { params: filters }).then((r) => unwrapPaginated<ConsultationEvent>(r)),

  reschedule: (id: string, startTime: string) =>
    api
      .patch(`/consultation-events/${id}/reschedule`, { startTime })
      .then((r) => unwrap<ConsultationEvent>(r)),

  remove: (id: string) => api.delete(`/consultation-events/${id}`).then(() => undefined),
}
