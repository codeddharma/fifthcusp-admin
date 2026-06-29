import { api } from './client'
import { unwrap } from './unwrap'
import type { InternalNote } from '@/types/internalNote'

export const InternalNotesApi = {
  list: () => api.get('/internal-notes').then((r) => unwrap<InternalNote[]>(r)),

  create: (content: string) => api.post('/internal-notes', { content }).then((r) => unwrap<InternalNote>(r)),

  update: (id: string, content: string) =>
    api.patch(`/internal-notes/${id}`, { content }).then((r) => unwrap<InternalNote>(r)),

  remove: (id: string) => api.delete(`/internal-notes/${id}`).then(() => undefined),
}
