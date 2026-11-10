import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getMeApi, loginApi, logoutApi, registerApi } from '../../api/auth'
import type { LoginPayload, RegisterPayload, User } from '../../types/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const data = await getMeApi()
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const data = await loginApi(payload)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload: RegisterPayload): Promise<User> => {
    const data = await registerApi(payload)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutApi()
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

