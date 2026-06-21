import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { Testimonial, TestimonialInput } from '@/types/testimonial'

export interface TestimonialListParams {
  page?: number
  limit?: number
  isApproved?: boolean
  isRejected?: boolean
}

export const TestimonialsApi = {
  list: (params: TestimonialListParams = {}) =>
    api.get('/testimonials', { params }).then((r) => unwrapPaginated<Testimonial>(r)),

  listByService: (serviceName: string) =>
    api.get(`/testimonials/service/${encodeURIComponent(serviceName)}`).then((r) => unwrap<Testimonial[]>(r)),

  get: (id: string) => api.get(`/testimonials/${id}`).then((r) => unwrap<Testimonial>(r)),

  create: (input: TestimonialInput) => api.post('/testimonials', input).then((r) => unwrap<Testimonial>(r)),

  update: (id: string, input: Partial<TestimonialInput>) =>
    api.put(`/testimonials/${id}`, input).then((r) => unwrap<Testimonial>(r)),

  approve: (id: string) => api.patch(`/testimonials/${id}/approve`).then((r) => unwrap<Testimonial>(r)),

  reject: (id: string) => api.patch(`/testimonials/${id}/reject`).then((r) => unwrap<Testimonial>(r)),

  remove: (id: string) => api.delete(`/testimonials/${id}`).then(() => undefined),
}
