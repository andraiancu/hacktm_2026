import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '~/utils/supabase'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  firstName: string | null
  initials: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

function pickFirstName(user: User | null): string | null {
  if (!user) {
    return null
  }

  const metadata = user.user_metadata as Record<string, unknown> | null
  const firstName = metadata?.first_name ?? metadata?.given_name
  if (typeof firstName === 'string' && firstName.trim()) {
    return firstName.trim()
  }

  const fullName = metadata?.full_name ?? metadata?.name
  if (typeof fullName === 'string' && fullName.trim()) {
    const [first] = fullName.trim().split(/\s+/)
    return first || null
  }

  return null
}

function pickInitials(user: User | null): string {
  if (!user) {
    return 'U'
  }

  const metadata = user.user_metadata as Record<string, unknown> | null
  const fullName = metadata?.full_name ?? metadata?.name
  if (typeof fullName === 'string' && fullName.trim()) {
    const parts = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)

    if (parts.length > 0) {
      return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
    }
  }

  const email = user.email ?? ''
  const localPart = email.split('@')[0] ?? ''
  if (localPart.trim()) {
    return localPart.slice(0, 2).toUpperCase()
  }

  return 'U'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return
      }
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) {
        return
      }
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isConfigured: isSupabaseConfigured,
      firstName: pickFirstName(user),
      initials: pickInitials(user),
    }),
    [loading, session, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
