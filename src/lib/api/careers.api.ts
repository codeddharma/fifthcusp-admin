import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { Career, CareerInput } from '@/types/career'

export interface CareerListParams {
  page?: number
  limit?: number
  isActive?: boolean
  isClosed?: boolean
}

export const CareersApi = {
  list: (params: CareerListParams = {}) =>
    api.get('/careers', { params }).then((r) => unwrapPaginated<Career>(r)),

  get: (id: string) => api.get(`/careers/${id}`).then((r) => unwrap<Career>(r)),

  create: (input: CareerInput) => api.post('/careers', input).then((r) => unwrap<Career>(r)),

  update: (id: string, input: Partial<CareerInput>) =>
    api.put(`/careers/${id}`, input).then((r) => unwrap<Career>(r)),

  close: (id: string) => api.patch(`/careers/${id}/close`).then((r) => unwrap<Career>(r)),

  remove: (id: string) => api.delete(`/careers/${id}`).then(() => undefined),
}
