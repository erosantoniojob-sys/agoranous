import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getErrorMessage, readBrowserValue, removeBrowserValue, writeBrowserValue } from '../lib/browserStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export const isSupabaseConfigured = isValidSupabaseUrl(supabaseUrl) && Boolean(supabaseAnonKey)
const safeSupabaseUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co'
const safeSupabaseKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-public-key'

// Mantém a tela de login disponível mesmo quando as variáveis da Vercel ainda
// não foram configuradas corretamente.
export const supabase = createClient(safeSupabaseUrl, safeSupabaseKey)

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

  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      try {
        const storedGuest = readBrowserValue<AuthUser | null>(LOCAL_STORAGE_GUEST_KEY, null)
        if (storedGuest && isMounted) {
          setUser(storedGuest)
          setIsLoading(false)
          return
        }

        if (!isSupabaseConfigured) {
          setError('A conexão com o Supabase não foi configurada. Confira VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY na Vercel.')
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && isMounted) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Membro da Ágora',
          })
        }
      } catch (err) {
        console.error('Erro na inicialização da autenticação:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    initAuth()

    if (!isSupabaseConfigured) {
      return () => {
        isMounted = false
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Membro da Ágora',
        })
      } else if (event === 'SIGNED_OUT' && !readBrowserValue<AuthUser | null>(LOCAL_STORAGE_GUEST_KEY, null)) {
        setUser(null)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    if (!isSupabaseConfigured) {
      setError('A conexão com o Supabase não foi configurada. Confira as variáveis de ambiente da Vercel.')
      setIsLoading(false)
      return false
    }
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass })
      if (authError) throw authError
      if (data.session) {
        removeBrowserValue(LOCAL_STORAGE_GUEST_KEY)
        setIsLoading(false)
        return true
      }
      return false
    } catch (err: unknown) {
      setIsLoading(false)
      const message = getErrorMessage(err, 'Erro ao realizar login.')
      setError(message.includes('Invalid login credentials') ? 'E-mail ou senha incorretos.' : message)
      return false
    }
  }

  const signup = async (email: string, pass: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    if (!isSupabaseConfigured) {
      setError('A conexão com o Supabase não foi configurada. Confira as variáveis de ambiente da Vercel.')
      setIsLoading(false)
      return false
    }
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: name } },
      })
      if (authError) throw authError
      if (data.user) {
        if (!data.session) {
          setError('Conta criada com sucesso! Verifique sua caixa de e-mail para confirmar.')
          setIsLoading(false)
          return false
        }
        removeBrowserValue(LOCAL_STORAGE_GUEST_KEY)
        setIsLoading(false)
        return true
      }
      return false
    } catch (err: unknown) {
      setIsLoading(false)
      const message = getErrorMessage(err, 'Erro ao criar conta.')
      setError(message.includes('User already registered') ? 'Este e-mail já está em uso.' : message)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
    } finally {
      removeBrowserValue(LOCAL_STORAGE_GUEST_KEY)
      setUser(null)
      setIsLoading(false)
    }
  }

  const loginAsGuest = () => {
    const guestUser: AuthUser = { id: 'guest_user', email: '', name: '' }
    setUser(guestUser)
    writeBrowserValue(LOCAL_STORAGE_GUEST_KEY, guestUser)
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout, loginAsGuest, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
