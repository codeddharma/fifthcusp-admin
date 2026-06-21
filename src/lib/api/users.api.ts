import { api } from './client'
import { unwrap, unwrapPaginated } from './unwrap'
import type { CreateUserInput, UpdateUserInput, User } from '@/types/user'

export interface UserListParams {
  page?: number
  limit?: number
  role?: string
  q?: string
}

export const UsersApi = {
  list: (params: UserListParams = {}) =>
    api.get('/users', { params }).then((r) => unwrapPaginated<User>(r)),

  get: (id: string) => api.get(`/users/${id}`).then((r) => unwrap<User>(r)),

  create: (input: CreateUserInput) => api.post('/users', input).then((r) => unwrap<User>(r)),

  update: (id: string, input: UpdateUserInput) => api.put(`/users/${id}`, input).then((r) => unwrap<User>(r)),

  remove: (id: string) => api.delete(`/users/${id}`).then(() => undefined),
}
