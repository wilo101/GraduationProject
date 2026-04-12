import { test, expect } from '@playwright/test'
import { skipSplash, waitForAuthShell, hasSupabaseEnv } from './helpers.js'

/**
 * OTP “delete and retry”: wrong code → error → clear OTP field → enter another wrong code.
 * Success path needs a real SMS code (not automated here).
 */
test.describe('Register with phone / OTP UI', () => {
    test.skip(!hasSupabaseEnv(), 'Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')

    test('send code, wrong OTP shows error; clear field and retry typing', async ({ page }) => {
        await page.goto('/GraduationProject/#/register', { waitUntil: 'domcontentloaded' })
        await skipSplash(page)
        await waitForAuthShell(page, 'register')

        await page.getByRole('button', { name: 'Phone' }).click()
        await page.locator('#register-name').fill('Playwright Phone User')
        await page.locator('#register-phone').fill('+12025550123')

        await page.getByRole('button', { name: 'Send code' }).click()

        const otpInput = page.locator('#register-otp')
        const otpVisible = await otpInput
            .waitFor({ state: 'visible', timeout: 20_000 })
            .then(() => true)
            .catch(() => false)
        if (!otpVisible) {
            const err = page.locator('[role="alert"]')
            await expect(err).toBeVisible({ timeout: 5000 })
            test.skip(true, 'SMS/phone provider likely not configured — OTP field never appeared')
        }

        await otpInput.fill('000000')
        await page.getByRole('button', { name: 'Verify code' }).click()

        const alert = page.locator('[role="alert"]').first()
        await expect(alert).toBeVisible({ timeout: 15_000 })

        await otpInput.clear()
        await expect(otpInput).toHaveValue('')

        await otpInput.fill('111111')
        await page.getByRole('button', { name: 'Verify code' }).click()
        await expect(alert).toBeVisible({ timeout: 15_000 })
    })
})
