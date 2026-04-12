/**
 * Client-only dev/demo bypass: specific email signs in without Supabase.
 * Not secure for production (visible in bundle). Remove or gate via env for release builds.
 */
const STORAGE_KEY = 'augustus_dev_bypass_v1'

/** Normalized allowed bypass address (lowercase). */
export const DEV_BYPASS_EMAIL = 'mohamed.marey@gmail.com'

export function isDevBypassEmail(email) {
    return email.trim().toLowerCase() === DEV_BYPASS_EMAIL
}

export function buildBypassSession(email) {
    const e = email.trim()
    return {
        user: {
            id: 'dev-bypass-local',
            email: e,
            user_metadata: { full_name: e.split('@')[0] || 'User' },
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
        if (!parsed?.user?.email || !isDevBypassEmail(parsed.user.email)) {
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
