/**
 * Client-only demo bypass: fixed email/password signs in without Supabase.
 * Not secure for production (visible in bundle). Remove or gate via env for release builds.
 */
const STORAGE_KEY = 'augustus_dev_bypass_v1'

/** Public demo login (shown on auth screens). */
export const DEMO_EMAIL = 'demo@test.com'
export const DEMO_PASSWORD = '123456'

/** @deprecated use DEMO_EMAIL */
export const DEV_BYPASS_EMAIL = DEMO_EMAIL

export function isDemoBypassEmail(email) {
    return email.trim().toLowerCase() === DEMO_EMAIL
}

/** @deprecated use isDemoBypassEmail */
export const isDevBypassEmail = isDemoBypassEmail

export function isDemoCredentials(email, password) {
    return isDemoBypassEmail(email) && password === DEMO_PASSWORD
}

export function buildBypassSession(email, options = {}) {
    const e = email.trim()
    const fullName = options.fullName?.trim() || 'Demo User'
    return {
        user: {
            id: 'dev-bypass-local',
            email: e,
            user_metadata: { full_name: fullName },
        },
        access_token: 'dev-bypass-local-only',
    }
}

export function loadStoredBypassSession() {
    if (typeof sessionStorage === 'undefined') return null
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        if (!parsed?.user?.email || !isDemoBypassEmail(parsed.user.email)) {
            sessionStorage.removeItem(STORAGE_KEY)
            return null
        }
        return parsed
    } catch {
        sessionStorage.removeItem(STORAGE_KEY)
        return null
    }
}

export function saveBypassSession(session) {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearBypassSessionStorage() {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.removeItem(STORAGE_KEY)
}
