import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import type { User } from '../lib/api'

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  })

  const fetchUser = useCallback(async () => {
    if (!api.getToken()) {
      setState({ user: null, loading: false, isAuthenticated: false })
      return
    }

    try {
      const user = await api.getMe()
      setState({ user, loading: false, isAuthenticated: true })
    } catch {
      // Token invalid, clear it
      api.setToken(null)
      setState({ user: null, loading: false, isAuthenticated: false })
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const signInWithMagicLink = async (email: string) => {
    try {
      const response = await api.requestMagicLink(email)
      // In dev mode, the API returns the token directly
      // In production, user would click link in email
      return { error: null, magicLink: response.magic_link, token: response.token }
    } catch (error) {
      return { error: error as Error, magicLink: null, token: null }
    }
  }

  const verifyToken = async (token: string) => {
    try {
      await api.verifyMagicLink(token)
      await fetchUser()
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      await api.logout()
    } finally {
      setState({ user: null, loading: false, isAuthenticated: false })
    }
    return { error: null }
  }

  const updateProfile = async (data: { name?: string; avatar_color?: string }) => {
    try {
      const user = await api.updateMe(data)
      setState(prev => ({ ...prev, user }))
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const refreshUser = useCallback(async () => {
    if (api.getToken()) {
      try {
        const user = await api.getMe()
        setState(prev => ({ ...prev, user }))
      } catch {
        // Ignore errors on refresh
      }
    }
  }, [])

  return {
    ...state,
    signInWithMagicLink,
    verifyToken,
    signOut,
    updateProfile,
    refreshUser,
  }
}
