import { api } from './client'
import { unwrap } from './unwrap'
import type { User } from '@/types/user'

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export const AuthApi = {
  login: (email: string, password: string) =>
    api.post<{ data: LoginResponse }>('/auth/login', { email, password }).then((r) => r.data.data),

  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }).then(() => undefined),

  me: () => api.get('/auth/me').then((r) => unwrap<User>(r)),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }).then(() => undefined),
}
