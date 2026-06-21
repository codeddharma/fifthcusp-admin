import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { env } from '../env'
import { clearTokens, getAccessToken } from './tokenStore'
import { refreshAccessTokenOnce } from './refreshQueue'

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

export const api = axios.create({
  baseURL: env.API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status

    if (!original || status !== 401) return Promise.reject(error)

    const url = original.url ?? ''
    // Don't try to refresh on the refresh/login endpoints themselves
    if (url.includes('/auth/refresh') || url.includes('/auth/login')) {
      return Promise.reject(error)
    }
    if (original._retry) return Promise.reject(error)
    original._retry = true

    try {
      const newToken = await refreshAccessTokenOnce()
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${newToken}`
      return api.request(original as AxiosRequestConfig)
    } catch (refreshErr) {
      clearTokens()
      // Notify the rest of the app that the session is gone.
      window.dispatchEvent(new CustomEvent('auth:logout'))
      return Promise.reject(refreshErr)
    }
  },
)
