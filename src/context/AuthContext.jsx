import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const E2E_AUTH =
    import.meta.env.VITE_E2E_AUTH === '1' || String(import.meta.env.VITE_E2E_AUTH).toLowerCase() === 'true'

const E2E_MOCK_SESSION = {
    user: {
        id: 'e2e-operator',
        email: 'e2e.operator@augustus.local',
        user_metadata: { full_name: 'E2E Operator' },
    },
    access_token: 'e2e-local-only',
}

const AuthContext = createContext(null)

function mapUser(sessionUser) {
    if (!sessionUser) return null
    const meta = sessionUser.user_metadata || {}
    return {
        id: sessionUser.id,
        email: sessionUser.email,
        name: meta.full_name || meta.name || sessionUser.email?.split('@')[0] || 'Operator',
        picture: meta.avatar_url || meta.picture || null,
        raw: sessionUser,
    }
}

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (E2E_AUTH) {
            setSession(E2E_MOCK_SESSION)
            setLoading(false)
            return
        }

        if (!supabase) {
            setLoading(false)
            return
        }

        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s)
            setLoading(false)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s)
        })

        return () => subscription.unsubscribe()
    }, [])

    const user = useMemo(() => mapUser(session?.user ?? null), [session])

    const isAuthenticated = Boolean(session)

    const logout = async () => {
        if (E2E_AUTH) {
            setSession(null)
            return
        }
        if (supabase) await supabase.auth.signOut()
        setSession(null)
    }

    const value = useMemo(
        () => ({
            isAuthenticated,
            user,
            session,
            loading,
            logout,
            supabaseReady: isSupabaseConfigured(),
        }),
        [isAuthenticated, user, session, loading]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
