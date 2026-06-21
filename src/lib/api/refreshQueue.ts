import axios from 'axios'
import { env } from '../env'
import { clearTokens, getRefreshToken, setAccessToken } from './tokenStore'

let refreshInFlight: Promise<string> | null = null

export function refreshAccessTokenOnce(): Promise<string> {
  if (refreshInFlight) return refreshInFlight

  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return Promise.reject(new Error('No refresh token'))
  }

  refreshInFlight = axios
    .post<{ data: { accessToken: string } }>(`${env.API_URL}/auth/refresh`, { refreshToken })
    .then((res) => {
      const access = res.data?.data?.accessToken
      if (!access) throw new Error('Refresh returned no access token')
      setAccessToken(access)
      return access
    })
    .catch((err) => {
      clearTokens()
      throw err
    })
    .finally(() => {
      refreshInFlight = null
    })

  return refreshInFlight
}
