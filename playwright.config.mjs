import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

const root = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(root, '.env.local') })
dotenv.config({ path: path.join(root, '.env') })

const e2eMockAuth = process.env.PW_E2E_AUTH === '1'

/**
 * Vite loads .env.local from disk and sets VITE_* even when absent from process.env.
 * Must set VITE_E2E_AUTH explicitly on the dev server: '0' for real auth UI, '1' only when PW_E2E_AUTH=1.
 */
const webServerEnv = { ...process.env }
delete webServerEnv.VITE_E2E_AUTH

/**
 * PW_E2E_AUTH=1 → Vite gets VITE_E2E_AUTH=1 (mock session) for dashboard e2e only.
 * Omit PW_E2E_AUTH for real Supabase register / OAuth tests (needs .env.local).
 */
export default defineConfig({
    testDir: 'e2e',
    timeout: 60_000,
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
    use: {
        /* Dedicated port so e2e never fights a manual dev server on 5173 */
        baseURL: 'http://127.0.0.1:5174',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npm run dev -- --host 127.0.0.1 --port 5174',
        url: 'http://127.0.0.1:5174/GraduationProject/',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
            ...webServerEnv,
            VITE_E2E_AUTH: e2eMockAuth ? '1' : '0',
        },
    },
})
