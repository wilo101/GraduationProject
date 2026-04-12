import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
/** Prefer modern publishable key; fall back to legacy anon JWT (see .env.example). */
const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

/** Where Google / magic links send the user back (must match Supabase → Authentication → URL Configuration). */
export function getAuthRedirectUrl() {
    const base = import.meta.env.BASE_URL || '/'
    const path = base.endsWith('/') ? base : `${base}/`
    return `${window.location.origin}${path}`
}

export const supabase =
    url && supabaseKey
        ? createClient(url, supabaseKey, {
              auth: {
                  persistSession: true,
                  autoRefreshToken: true,
                  detectSessionInUrl: true,
                  flowType: 'pkce',
              },
          })
        : null

export function isSupabaseConfigured() {
    return Boolean(url && supabaseKey)
}
