import { test, expect } from '@playwright/test'
import { skipSplash } from './helpers.js'

test.describe('Authenticated console (mock session)', () => {
    test.beforeEach(() => {
        test.skip(process.env.PW_E2E_AUTH !== '1', 'Run: npm run test:e2e:auth (sets PW_E2E_AUTH=1 for Vite)')
    })

    test('dashboard hero visible', async ({ page }) => {
        await page.goto('/GraduationProject/')
        await skipSplash(page)
        await expect(page.getByRole('heading', { name: 'Operations center' })).toBeVisible()
    })

    test('sidebar reaches Map and back', async ({ page }) => {
        await page.goto('/GraduationProject/')
        await skipSplash(page)
        await page.getByRole('link', { name: 'Map' }).click()
        await expect(page.getByRole('heading', { name: 'Map' })).toBeVisible()
        await page.getByRole('link', { name: 'Overview' }).click()
        await expect(page.getByRole('heading', { name: 'Operations center' })).toBeVisible()
    })
})
