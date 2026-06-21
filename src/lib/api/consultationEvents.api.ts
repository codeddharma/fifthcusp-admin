import { api } from './client'
import { unwrapPaginated } from './unwrap'
import type { ConsultationEvent, ConsultationEventFilters } from '@/types/consultationEvent'

export const ConsultationEventsApi = {
  list: (filters: ConsultationEventFilters = {}) =>
    api.get('/consultation-events', { params: filters }).then((r) => unwrapPaginated<ConsultationEvent>(r)),

  remove: (id: string) => api.delete(`/consultation-events/${id}`).then(() => undefined),
}
