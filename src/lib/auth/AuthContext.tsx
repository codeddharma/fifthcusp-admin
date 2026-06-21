import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { AuthApi } from '@/lib/api/auth.api'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  loadTokens,
  setTokens,
} from '@/lib/api/tokenStore'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  status: 'booting' | 'authed' | 'guest'
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  refreshMe: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthState['status']>('booting')

  const refreshMe = useCallback(async () => {
    try {
      const me = await AuthApi.me()
      setUser(me)
      setStatus('authed')
    } catch {
      clearTokens()
      setUser(null)
      setStatus('guest')
    }
  }, [])

  useEffect(() => {
    loadTokens()
    if (getAccessToken()) {
      void refreshMe()
    } else {
      setStatus('guest')
    }
  }, [refreshMe])

  useEffect(() => {
    function onLogout() {
      setUser(null)
      setStatus('guest')
    }
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await AuthApi.login(email, password)
    setTokens(result.accessToken, result.refreshToken)
    setUser(result.user)
    setStatus('authed')
    return result.user
  }, [])

  const logout = useCallback(async () => {
    const rt = getRefreshToken()
    if (rt) {
      try {
        await AuthApi.logout(rt)
      } catch {
        /* swallow */
      }
    }
    clearTokens()
    setUser(null)
    setStatus('guest')
  }, [])

  const value = useMemo<AuthState>(() => ({ user, status, login, logout, refreshMe }), [user, status, login, logout, refreshMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
