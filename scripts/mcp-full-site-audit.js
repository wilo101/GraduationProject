/**
 * Loaded by Playwright MCP browser_run_code (filename).
 * Audits http://127.0.0.1:5173/GraduationProject/ with VITE_E2E_AUTH=1.
 */
async (page) => {
    const base = 'http://127.0.0.1:5173/GraduationProject'
    const report = { passed: [], failed: [], notes: [] }
    const consoleErrors = []
    const pageErrors = []
    page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => pageErrors.push(String(err.message)))

    async function skipSplash() {
        const skip = page.getByRole('button', { name: 'Skip' })
        if (await skip.isVisible().catch(() => false)) {
            await skip.click()
            await page.waitForTimeout(400)
        }
    }

    async function gotoHash(path) {
        const hash = path.startsWith('/') ? path : `/${path}`
        await page.goto(`${base}/#${hash}`, { waitUntil: 'domcontentloaded', timeout: 25000 })
        await skipSplash()
        await page.waitForTimeout(300)
    }

    async function headingVisible(name, exact = true) {
        const h = page.getByRole('heading', { name, exact })
        return h.first().isVisible().catch(() => false)
    }

    const routes = [
        { path: '/', assert: () => headingVisible('Operations center') },
        { path: '/map-view', assert: () => headingVisible('Map') },
        { path: '/deploy', assert: () => headingVisible('Manual Override') },
        { path: '/diagnostics', assert: () => headingVisible('System Diagnostics') },
        { path: '/settings', assert: () => headingVisible('Settings') },
        { path: '/cameras', assert: () => headingVisible('Cameras') },
        { path: '/charge', assert: () => headingVisible('Charging') },
    ]

    for (const r of routes) {
        try {
            await gotoHash(r.path)
            const ok = await r.assert()
            if (ok) report.passed.push(`route:${r.path}`)
            else report.failed.push({ check: `route:${r.path}`, reason: 'expected heading not visible' })
        } catch (e) {
            report.failed.push({ check: `route:${r.path}`, reason: String(e) })
        }
    }

    try {
        await gotoHash('/')
        await page.getByRole('button', { name: /View & Pair Devices/i }).click()
        await page.waitForTimeout(350)
        const dialogs = page.getByRole('dialog')
        const n = await dialogs.count()
        let opened = false
        for (let i = 0; i < n; i++) {
            if (await dialogs.nth(i).isVisible().catch(() => false)) {
                opened = true
                break
            }
        }
        if (!opened) report.notes.push('pair-devices: no visible dialog')
        else {
            await page.keyboard.press('Escape')
            report.passed.push('pair-modal')
        }
    } catch (e) {
        report.failed.push({ check: 'pair-modal', reason: String(e) })
    }

    try {
        await gotoHash('/settings')
        await page.getByRole('button', { name: 'Log Out' }).click()
        await page.waitForTimeout(250)
        await page.getByRole('button', { name: 'Log out anyway' }).click()
        await page.waitForFunction(() => window.location.hash.includes('login'), { timeout: 15000 })
        report.passed.push('logout')
    } catch (e) {
        report.failed.push({ check: 'logout', reason: String(e) })
    }

    try {
        const welcome = await headingVisible('Welcome back')
        if (!welcome) report.failed.push({ check: 'login-page', reason: 'Welcome back not visible' })
        else report.passed.push('login-page')
        await page.locator('#login-email').fill('')
        await page.locator('#login-password').fill('')
        await page.getByRole('button', { name: 'Sign in' }).click()
        await page.waitForTimeout(500)
        const errVisible = await page
            .locator('[role="alert"].form-error, .form-error[role="alert"]')
            .first()
            .isVisible()
            .catch(() => false)
        if (errVisible) report.passed.push('login-client-validation')
        else report.notes.push('login-validation: no alert visible (check selectors)')
    } catch (e) {
        report.failed.push({ check: 'login-validation', reason: String(e) })
    }

    for (const path of ['/privacy', '/terms']) {
        try {
            await gotoHash(path)
            const h = await page.getByRole('heading').first().isVisible().catch(() => false)
            if (h) report.passed.push(`static:${path}`)
            else report.failed.push({ check: path, reason: 'no heading' })
        } catch (e) {
            report.failed.push({ check: path, reason: String(e) })
        }
    }

    try {
        await gotoHash('/register')
        const reg = await page.getByRole('heading').first().isVisible().catch(() => false)
        if (reg) report.passed.push('register-page')
        else report.failed.push({ check: '/register', reason: 'no heading' })
    } catch (e) {
        report.failed.push({ check: '/register', reason: String(e) })
    }

    try {
        await gotoHash('/')
        await skipSplash()
        await page.waitForTimeout(600)
        const hash = await page.evaluate(() => window.location.hash)
        if (hash.includes('login')) report.passed.push('protected-redirect-when-logged-out')
        else report.failed.push({ check: 'protected-redirect', reason: `hash=${hash}` })
    } catch (e) {
        report.failed.push({ check: 'protected-redirect', reason: String(e) })
    }

    report.consoleErrors = [...new Set(consoleErrors)].slice(0, 40)
    report.pageErrors = [...new Set(pageErrors)].slice(0, 20)
    return JSON.stringify(report, null, 2)
}
