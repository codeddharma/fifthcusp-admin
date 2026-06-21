import { api } from './client'
import { unwrap } from './unwrap'
import type { PageMeta, PageMetaInput } from '@/types/pageMeta'

export const PageMetaApi = {
  list: () => api.get('/page-meta').then((r) => unwrap<PageMeta[]>(r)),

  create: (input: PageMetaInput) => api.post('/page-meta', input).then((r) => unwrap<PageMeta>(r)),

  update: (id: string, input: Partial<PageMetaInput>) =>
    api.put(`/page-meta/${id}`, input).then((r) => unwrap<PageMeta>(r)),

  remove: (id: string) => api.delete(`/page-meta/${id}`).then((r) => unwrap<null>(r)),
}
