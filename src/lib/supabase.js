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

/**
 * OAuth/PKCE often returns with ?error= / ?code= on the real URL while HashRouter uses the hash for routes.
 * Show errors and strip the query so the URL is clean (only when there is an error, never when ?code= is present).
 */
export function consumeOAuthSearchParamsIfError() {
    if (typeof window === 'undefined') return null
    const sp = new URLSearchParams(window.location.search)
    if (sp.get('code')) return null
    const err = sp.get('error')
    const errDesc = sp.get('error_description')
    if (!err && !errDesc) return null
    const raw = errDesc || err || ''
    const message = decodeURIComponent(String(raw).replace(/\+/g, ' '))
    const path = window.location.pathname || ''
    const hash = window.location.hash || ''
    const clean = `${path}${hash}`
    window.history.replaceState(null, '', clean)
    return message
}
