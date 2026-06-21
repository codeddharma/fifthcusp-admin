const ACCESS_KEY = 'fc.admin.access'
const REFRESH_KEY = 'fc.admin.refresh'

let accessToken: string | null = null

export function loadTokens() {
  try {
    accessToken = localStorage.getItem(ACCESS_KEY)
  } catch {
    accessToken = null
  }
}

export function getAccessToken(): string | null {
  return accessToken
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export function setTokens(access: string, refresh?: string) {
  accessToken = access
  try {
    localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  } catch {
    /* ignore quota errors */
  }
}

export function setAccessToken(access: string) {
  accessToken = access
  try {
    localStorage.setItem(ACCESS_KEY, access)
  } catch {
    /* ignore */
  }
}

export function clearTokens() {
  accessToken = null
  try {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  } catch {
    /* ignore */
  }
}
