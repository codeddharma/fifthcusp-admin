import { api } from './client'
import { unwrap } from './unwrap'
import type { CreatePageInput, PageContent, UpdatePageMetaInput, UpsertSectionInput } from '@/types/content'

export const ContentApi = {
  // Public preview
  getPublic: (page: string) => api.get(`/content/${page}`).then((r) => unwrap<PageContent>(r)),

  // Admin list (any role with read)
  list: () => api.get('/content').then((r) => unwrap<PageContent[]>(r)),

  create: (input: CreatePageInput) => api.post('/content', input).then((r) => unwrap<PageContent>(r)),

  getAdmin: (page: string) => api.get(`/content/admin/${page}`).then((r) => unwrap<PageContent>(r)),

  updateMeta: (page: string, input: UpdatePageMetaInput) =>
    api.put(`/content/admin/${page}`, input).then((r) => unwrap<PageContent>(r)),

  deletePage: (page: string) => api.delete(`/content/admin/${page}`).then(() => undefined),

  upsertSection: (page: string, key: string, input: UpsertSectionInput) =>
    api.put(`/content/admin/${page}/sections/${key}`, input).then((r) => unwrap<PageContent>(r)),

  deleteSection: (page: string, key: string) =>
    api.delete(`/content/admin/${page}/sections/${key}`).then((r) => unwrap<PageContent>(r)),

  reorderSections: (page: string, order: string[]) =>
    api
      .patch(`/content/admin/${page}/sections/reorder`, { order })
      .then((r) => unwrap<PageContent>(r)),
}
