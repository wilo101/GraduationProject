/**
 * @param {import('@playwright/test').Page} page
 */
export async function skipSplash(page) {
    const b = page.getByRole('button', { name: 'Skip' })
    try {
        await b.click({ timeout: 12_000 })
        await page.waitForTimeout(400)
    } catch {
    /* Splash already finished or not shown */
    }
}

/**
 * After navigating to an auth route, wait for the real auth UI (fails fast if mock auth redirected away).
 * @param {import('@playwright/test').Page} page
 * @param {'register' | 'login'} screen
 */
export async function waitForAuthShell(page, screen) {
    const h =
        screen === 'login'
            ? page.getByRole('heading', { name: 'Welcome back' })
            : page.getByRole('heading', { name: 'Create account' })
    await h.waitFor({ state: 'visible', timeout: 45_000 })
}

export function hasSupabaseEnv() {
    return Boolean(
        process.env.VITE_SUPABASE_URL &&
            (process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY)
    )
}
