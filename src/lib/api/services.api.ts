import { api } from './client'
import { unwrap } from './unwrap'
import type { Service, ServiceInput } from '@/types/service'

export interface ServiceListParams {
  onlyActive?: boolean
  page?: string
  type?: string
}

export const ServicesApi = {
  list: (params: ServiceListParams = {}) =>
    api.get('/services', { params }).then((r) => unwrap<Service[]>(r)),

  get: (id: string) => api.get(`/services/${id}`).then((r) => unwrap<Service>(r)),

  create: (input: ServiceInput) => api.post('/services', input).then((r) => unwrap<Service>(r)),

  update: (id: string, input: Partial<ServiceInput>) =>
    api.put(`/services/${id}`, input).then((r) => unwrap<Service>(r)),

  remove: (id: string) => api.delete(`/services/${id}`).then(() => undefined),
}
