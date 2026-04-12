import { test, expect } from '@playwright/test'
import { skipSplash, waitForAuthShell, hasSupabaseEnv } from './helpers.js'

test.describe('Sign in with email', () => {
    test.skip(!hasSupabaseEnv(), 'Requires .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')

    test('client validation on empty submit', async ({ page }) => {
        await page.goto('/GraduationProject/#/login', { waitUntil: 'domcontentloaded' })
        await skipSplash(page)
        await waitForAuthShell(page, 'login')

        await page.getByRole('button', { name: 'Sign in' }).click()

        await expect(page.locator('#login-email-err')).toBeVisible()
        await expect(page.locator('#login-password-err')).toBeVisible()
    })

    test('wrong password shows error from API', async ({ page }) => {
        await page.goto('/GraduationProject/#/login', { waitUntil: 'domcontentloaded' })
        await skipSplash(page)
        await waitForAuthShell(page, 'login')

        await page.locator('#login-email').fill(`pw.nope.${Date.now()}@gmail.com`)
        await page.locator('#login-password').fill('WrongPass999!')

        const res = page.waitForResponse(
            (r) => r.url().includes('supabase.co') && r.url().includes('token') && r.request().method() === 'POST',
            { timeout: 20_000 }
        )
        await page.getByRole('button', { name: 'Sign in' }).click()
        await res

        const alert = page.locator('[role="alert"].form-error').first()
        await expect(alert).toBeVisible({ timeout: 12_000 })
        const t = (await alert.innerText()).toLowerCase()
        expect(t).toMatch(/invalid|credentials|password|email|error|wrong/)
    })
})
