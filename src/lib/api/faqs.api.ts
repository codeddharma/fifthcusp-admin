import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { Faq, FaqInput } from '@/types/faq'

export const FaqsApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    api.get('/faqs', { params }).then((r) => unwrapPaginated<Faq>(r)),

  getByPage: (page: string) => api.get(`/faqs/page/${page}`).then((r) => unwrap<Faq>(r)),

  get: (id: string) => api.get(`/faqs/${id}`).then((r) => unwrap<Faq>(r)),

  create: (input: FaqInput) => api.post('/faqs', input).then((r) => unwrap<Faq>(r)),

  update: (id: string, input: Partial<FaqInput>) =>
    api.put(`/faqs/${id}`, input).then((r) => unwrap<Faq>(r)),

  remove: (id: string) => api.delete(`/faqs/${id}`).then(() => undefined),
}
