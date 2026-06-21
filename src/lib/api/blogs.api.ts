import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { Blog, BlogInput } from '@/types/blog'

export interface BlogListParams {
  page?: number
  limit?: number
  category?: string
  isPublished?: boolean
}

export const BlogsApi = {
  list: (params: BlogListParams = {}) =>
    api.get('/blogs', { params }).then((r) => unwrapPaginated<Blog>(r)),

  get: (id: string) => api.get(`/blogs/${id}`).then((r) => unwrap<Blog>(r)),

  getBySlug: (slug: string) => api.get(`/blogs/slug/${slug}`).then((r) => unwrap<Blog>(r)),

  create: (input: BlogInput) => api.post('/blogs', input).then((r) => unwrap<Blog>(r)),

  update: (id: string, input: Partial<BlogInput>) =>
    api.put(`/blogs/${id}`, input).then((r) => unwrap<Blog>(r)),

  publish: (id: string) => api.patch(`/blogs/${id}/publish`).then((r) => unwrap<Blog>(r)),

  unpublish: (id: string) => api.patch(`/blogs/${id}/unpublish`).then((r) => unwrap<Blog>(r)),

  remove: (id: string) => api.delete(`/blogs/${id}`).then(() => undefined),
}
