import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  getUser,
  login as netlifyLogin,
  signup as netlifySignup,
  logout as netlifyLogout,
  onAuthChange,
  handleAuthCallback,
  AuthError,
  MissingIdentityError,
  AUTH_EVENTS,
} from '@netlify/identity'

export interface AuthUser {
  id: string
  email: string
  name: string
  role?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  login: (email: string, pass: string) => Promise<boolean>
  signup: (email: string, pass: string, name: string) => Promise<boolean>
  logout: () => Promise<void>
  loginAsGuest: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LOCAL_STORAGE_GUEST_KEY = 'agora_guest_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize Auth state on load
  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      try {
        // Handle potential OAuth or email confirmation redirect callback
        try {
          const callbackResult = await handleAuthCallback()
          if (callbackResult?.user) {
            const u = callbackResult.user
            if (isMounted) {
              const full_name = (u.userMetadata as any)?.full_name || (u as any).user_metadata?.full_name
              setUser({
                id: u.id,
                email: u.email || '',
                name: full_name || u.email?.split('@')[0] || 'Membro da Ágora',
              })
              setIsLoading(false)
              return
            }
          }
        } catch (err) {
          console.warn('Auth callback check note:', err)
        }

        // Check active Netlify Identity session
        try {
          const activeUser = await getUser()
          if (activeUser && isMounted) {
            const full_name = (activeUser.userMetadata as any)?.full_name || (activeUser as any).user_metadata?.full_name
            setUser({
              id: activeUser.id,
              email: activeUser.email || '',
              name: full_name || activeUser.email?.split('@')[0] || 'Membro da Ágora',
            })
            setIsLoading(false)
            return
          }
        } catch (err) {
          if (err instanceof MissingIdentityError) {
            console.log('Netlify Identity not active in environment, checking local guest mode')
          }
        }

        // Check local guest/demo session fallback
        const storedGuest = localStorage.getItem(LOCAL_STORAGE_GUEST_KEY)
        if (storedGuest && isMounted) {
          try {
            setUser(JSON.parse(storedGuest))
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY)
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    initAuth()

    // Subscribe to Netlify Identity Auth Changes
    const unsubscribe = onAuthChange((event, netlifyUser) => {
      if (netlifyUser) {
        const full_name = (netlifyUser.userMetadata as any)?.full_name || (netlifyUser as any).user_metadata?.full_name
        setUser({
          id: netlifyUser.id,
          email: netlifyUser.email || '',
          name: full_name || netlifyUser.email?.split('@')[0] || 'Membro da Ágora',
        })
      } else if (event === AUTH_EVENTS.LOGOUT && !localStorage.getItem(LOCAL_STORAGE_GUEST_KEY)) {
        setUser(null)
      }
    })

    return () => {
      isMounted = false
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const netlifyUser = await netlifyLogin(email, pass)
      if (netlifyUser) {
        const full_name = (netlifyUser.userMetadata as any)?.full_name || (netlifyUser as any).user_metadata?.full_name
        setUser({
          id: netlifyUser.id,
          email: netlifyUser.email || email,
          name: full_name || email.split('@')[0] || 'Membro da Ágora',
        })
        localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY)
        setIsLoading(false)
        return true
      }
      return false
    } catch (err) {
      setIsLoading(false)
      if (err instanceof MissingIdentityError) {
        // Fallback for local testing if Netlify Identity CLI is not running locally
        const mockUser: AuthUser = {
          id: 'usr_local_' + Date.now(),
          email,
          name: email.split('@')[0] || 'Membro da Ágora',
        }
        setUser(mockUser)
        localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, JSON.stringify(mockUser))
        return true
      }
      if (err instanceof AuthError) {
        if (err.status === 401) {
          setError('Credenciais inválidas. Verifique seu e-mail e senha.')
        } else if (err.status === 400 || err.status === 422) {
          setError('Dados de login inválidos.')
        } else {
          setError(err.message || 'Erro ao realizar login.')
        }
        return false
      }
      setError(err instanceof Error ? err.message : 'Falha na autenticação.')
      return false
    }
  }

  const signup = async (email: string, pass: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const netlifyUser = await netlifySignup(email, pass, { full_name: name })
      if (netlifyUser) {
        const isConfirmed = Boolean(netlifyUser.confirmedAt || (netlifyUser as any).emailVerified)
        if (isConfirmed) {
          setUser({
            id: netlifyUser.id,
            email: netlifyUser.email || email,
            name: name || 'Membro da Ágora',
          })
          localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY)
        } else {
          setError('Conta criada com sucesso! Por favor, verifique seu e-mail para confirmar a conta.')
        }
        setIsLoading(false)
        return true
      }
      return false
    } catch (err) {
      setIsLoading(false)
      if (err instanceof MissingIdentityError) {
        const mockUser: AuthUser = {
          id: 'usr_local_' + Date.now(),
          email,
          name: name || 'Membro da Ágora',
        }
        setUser(mockUser)
        localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, JSON.stringify(mockUser))
        return true
      }
      if (err instanceof AuthError) {
        if (err.status === 403) {
          setError('Registros públicos estão desativados para esta instância.')
        } else {
          setError(err.message || 'Erro ao criar conta.')
        }
        return false
      }
      setError(err instanceof Error ? err.message : 'Falha ao registrar usuário.')
      return false
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await netlifyLogout()
    } catch (err) {
      console.warn('Logout netlify notice:', err)
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY)
      setUser(null)
      setIsLoading(false)
    }
  }

  const loginAsGuest = () => {
    if (typeof localStorage !== 'undefined') {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('agora_guest')) {
          localStorage.removeItem(key)
        }
      })
    }

    const guestUser: AuthUser = {
      id: 'guest_user',
      email: '',
      name: '',
    }
    setUser(guestUser)
    localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, JSON.stringify(guestUser))
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        signup,
        logout,
        loginAsGuest,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
