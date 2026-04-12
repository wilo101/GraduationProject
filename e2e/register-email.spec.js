import { test, expect } from '@playwright/test'
import { skipSplash, waitForAuthShell, hasSupabaseEnv } from './helpers.js'

test.describe('Register with email', () => {
    test.skip(!hasSupabaseEnv(), 'Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')

    test('submits signup; shows confirmation or API error in UI', async ({ page }) => {
        await page.goto('/GraduationProject/#/register', { waitUntil: 'domcontentloaded' })
        await skipSplash(page)
        await waitForAuthShell(page, 'register')

        await page.locator('#register-name').fill('Playwright Email User')
        const email = `pw.e2e.${Date.now()}@gmail.com`
        await page.locator('#register-email').fill(email)
        await page.locator('#register-password').fill('TestPass888!')

        const res = page.waitForResponse(
            (r) => r.url().includes('supabase.co') && r.url().includes('signup'),
            { timeout: 15_000 }
        )
        await page.getByRole('button', { name: 'Create account' }).click()
        const response = await res
        expect([200, 400, 422, 429]).toContain(response.status())

        const alert = page.locator('[role="alert"]').first()
        await expect(alert).toBeVisible({ timeout: 12_000 })
        const text = (await alert.innerText()).toLowerCase()
        expect(text.length).toBeGreaterThan(3)
    })
})
