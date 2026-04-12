const KEY = 'augustus:smoothAppEnter'

/** Call right before navigating to `/` after successful sign-in (or auto-login after register). */
export function markSmoothAppEnter() {
    try {
        sessionStorage.setItem(KEY, '1')
    } catch {
        /* ignore quota / private mode */
    }
}

/** Read once on app shell mount; clears the flag. */
export function consumeSmoothAppEnter() {
    try {
        if (sessionStorage.getItem(KEY) !== '1') return false
        sessionStorage.removeItem(KEY)
        return true
    } catch {
        return false
    }
}
