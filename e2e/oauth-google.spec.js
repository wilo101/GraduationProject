import { test, expect } from '@playwright/test'
import { skipSplash, waitForAuthShell, hasSupabaseEnv } from './helpers.js'

test.describe('Google OAuth (start only)', () => {
    test.skip(!hasSupabaseEnv(), 'Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')

    test('Register: Google leaves app toward Supabase or Google', async ({ page }) => {
        await page.goto('/GraduationProject/#/register', { waitUntil: 'domcontentloaded' })
        await skipSplash(page)
        await waitForAuthShell(page, 'register')

        await page.getByRole('button', { name: 'Google' }).click()

        await expect(page).toHaveURL(/supabase\.co|accounts\.google\.com/, { timeout: 20_000 })
    })

    test('Login: Google leaves app toward Supabase or Google', async ({ page }) => {
        await page.goto('/GraduationProject/#/login', { waitUntil: 'domcontentloaded' })
        await skipSplash(page)
        await waitForAuthShell(page, 'login')

        await page.getByRole('button', { name: 'Google' }).click()

        await expect(page).toHaveURL(/supabase\.co|accounts\.google\.com/, { timeout: 20_000 })
    })
})
