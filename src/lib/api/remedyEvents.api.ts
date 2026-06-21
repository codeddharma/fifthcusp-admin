import { api } from './client'
import { unwrapPaginated } from './unwrap'
import type { RemedyEvent, RemedyEventFilters } from '@/types/remedyEvent'

export interface RemedyEventInput {
  customerId: string
  orderId?: string
  remedyName: string
  notes?: string
  scheduledAt: string
}

export const RemedyEventsApi = {
  list: (filters: RemedyEventFilters = {}) =>
    api.get('/remedy-events', { params: filters }).then((r) => unwrapPaginated<RemedyEvent>(r)),

  create: (input: RemedyEventInput) =>
    api.post('/remedy-events', input).then((r) => r.data.data as RemedyEvent),

  remove: (id: string) => api.delete(`/remedy-events/${id}`).then(() => undefined),
}
