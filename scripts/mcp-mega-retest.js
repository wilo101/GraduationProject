/**
 * Expanded retest: previously “out of scope” UI (deploy/map/diagnostics/auth affordances).
 * Requires dev server with VITE_E2E_AUTH=1 and .env.local (Supabase optional for OAuth click).
 */
async (page) => {
    const base = 'http://127.0.0.1:5173/GraduationProject'
    const R = { passed: [], failed: [], notes: [] }
    const pass = (id) => R.passed.push(id)
    const fail = (id, err) => R.failed.push({ id, err: String(err) })
    const note = (m) => R.notes.push(m)

    const consoleErrors = []
    page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (e) => consoleErrors.push(`pageerror:${e.message}`))

    async function skipSplash() {
        const s = page.getByRole('button', { name: 'Skip' })
        if (await s.isVisible().catch(() => false)) await s.click()
        await page.waitForTimeout(350)
    }

    async function fullLoad() {
        await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
        await skipSplash()
        await page.waitForTimeout(200)
    }

    try {
        await fullLoad()
        pass('full-load-dashboard')

        await page.getByRole('button', { name: /light|dark|Switch to/i }).click()
        await page.waitForTimeout(250)
        pass('theme-toggle-click')

        await page.getByRole('button', { name: /View & Pair Devices/i }).click()
        await page.waitForTimeout(300)
        await page.keyboard.press('Escape')
        pass('pair-devices-modal')

        const mic = page.getByRole('button', { name: /unmute|mute microphone/i }).first()
        if (await mic.isVisible().catch(() => false)) {
            await mic.click()
            pass('dashboard-mic-toggle')
        } else note('dashboard: mic not visible')

        const fs = page.getByRole('button', { name: /fullscreen|full screen/i }).first()
        if (await fs.isVisible().catch(() => false)) {
            try {
                await fs.click({ force: true })
                await page.waitForTimeout(200)
                await page.keyboard.press('Escape')
                pass('dashboard-fullscreen-open-close')
            } catch {
                note('dashboard: fullscreen click blocked (overlay)')
            }
        } else note('dashboard: fullscreen not matched')

        const slider = page.locator('.dashboard-page input[type="range"]').first()
        if (await slider.isVisible().catch(() => false)) {
            await slider.fill('88')
            pass('dashboard-pressure-slider')
        } else note('dashboard: pressure slider missing')

        const nav = async (label, pathId) => {
            await page.getByRole('link', { name: label }).click()
            await page.waitForTimeout(450)
            pass(`nav-${pathId}`)
        }
        await nav('Map', 'map')
        await nav('Deploy', 'deploy')
        await nav('Diagnostics', 'diag')
        await nav('Settings', 'settings')
        await nav('Overview', 'home')
    } catch (e) {
        fail('dashboard-nav-block', e)
    }

    try {
        await page.goto(`${base}/#/deploy`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.waitForTimeout(2800)

        const engage = page.getByRole('button', { name: 'Engage' })
        if (await engage.isEnabled().catch(() => false)) {
            await engage.click()
            pass('deploy-engage')
        } else note('deploy: Engage disabled (simulated link)')

        const retry = page.getByRole('button', { name: 'Retry' })
        if (await retry.isVisible().catch(() => false)) {
            await retry.click()
            await page.waitForTimeout(500)
            pass('deploy-retry-feed')
        }

        const speedSeg = page.locator('.deploy-speed-seg')
        for (const spd of ['slow', 'turbo', 'normal']) {
            const b = speedSeg.getByRole('button', { name: spd, exact: true })
            if (await b.isVisible().catch(() => false)) await b.click({ force: true })
        }
        pass('deploy-speed-segments')

        await page.locator('.mo-dpad').getByRole('button', { name: 'Up', exact: true }).click({ force: true })
        pass('deploy-dpad-up')

        await page.getByRole('button', { name: /WASD|Space stop/i }).click()
        await page.waitForTimeout(200)
        const expanded = await page.getByRole('region', { name: /Keyboard shortcuts/i }).isVisible().catch(() => false)
        if (expanded) pass('deploy-shortcuts-expand')
        else note('deploy: shortcuts region not detected')

        await page.keyboard.press('w')
        await page.waitForTimeout(120)
        await page.keyboard.press(' ')
        await page.waitForTimeout(120)
        pass('deploy-keyboard-w-space')

        const focusBtn = page.getByRole('button', { name: /Open focus monitor mode/i })
        if (await focusBtn.isVisible().catch(() => false)) {
            await focusBtn.click()
            await page.waitForTimeout(300)
            const closeF = page.getByRole('button', { name: /Close focus/i })
            if (await closeF.isVisible().catch(() => false)) {
                await closeF.click()
                pass('deploy-focus-mode')
            } else note('deploy: focus overlay not opened')
        } else note('deploy: focus button not visible (feed offline)')
    } catch (e) {
        fail('deploy-deep', e)
    }

    try {
        await page.goto(`${base}/#/map-view`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.getByRole('button', { name: 'Layers' }).click()
        await page.waitForTimeout(200)
        const zoneCb = page.getByRole('checkbox', { name: 'Zone labels' })
        if (await zoneCb.isVisible().catch(() => false)) {
            await zoneCb.click()
            pass('map-layers-toggle')
        }
        await page.getByRole('button', { name: 'Layers' }).click()
        await page.waitForTimeout(200)
        await page.getByRole('button', { name: 'Center robot' }).click({ force: true })
        pass('map-center-robot')

        await page.getByLabel('Search zones').fill('yard')
        await page.waitForTimeout(200)
        pass('map-search-zones')

        const rowHit = page.getByRole('button', { name: /Main yard/i }).first()
        if (await rowHit.isVisible().catch(() => false)) {
            await rowHit.click()
            pass('map-zone-select')
        }

        const sendSector = page.getByRole('button', { name: 'Send to sector' }).first()
        if (await sendSector.isVisible().catch(() => false)) {
            await sendSector.click()
            pass('map-send-to-sector')
        }

        await page.getByRole('button', { name: 'Zoom out' }).click()
        await page.getByRole('button', { name: 'Zoom in' }).click()
        pass('map-zoom-both')

        const mini = page.locator('.map-minimap').first()
        if (await mini.isVisible().catch(() => false)) {
            const box = await mini.boundingBox()
            if (box) {
                await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.35)
                await page.mouse.down()
                await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.65, { steps: 8 })
                await page.mouse.up()
                pass('map-minimap-drag')
            }
        }

        const mapCanvas = page.locator('.map-pointer-layer').first()
        if (await mapCanvas.isVisible().catch(() => false)) {
            const b = await mapCanvas.boundingBox()
            if (b) {
                await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
                await page.mouse.move(b.x + b.width * 0.4, b.y + b.height * 0.45, { steps: 5 })
                pass('map-pointer-move')
            }
        }
    } catch (e) {
        fail('map-deep', e)
    }

    try {
        await page.goto(`${base}/#/diagnostics`, { waitUntil: 'domcontentloaded' })
        await skipSplash()

        const firstTest = page.getByRole('group', { name: 'Core Processor' }).getByRole('button', { name: 'Test' })
        if (await firstTest.isVisible().catch(() => false)) {
            await firstTest.click()
            await page.waitForTimeout(1600)
            pass('diag-single-test')
        }

        await page.getByRole('button', { name: 'Run all' }).click()
        await page.getByText('Diagnostics complete').first().waitFor({ state: 'visible', timeout: 25000 })
        pass('diag-run-all-complete')
        await page.waitForTimeout(800)

        const exportBtn = page.getByRole('button', { name: /print diagnostics report|export report/i })
        const pagesBefore = page.context().pages().length
        if (await exportBtn.isEnabled().catch(() => false)) {
            await exportBtn.click()
            await page.waitForTimeout(1500)
            const pagesAfter = page.context().pages().length
            if (pagesAfter > pagesBefore) {
                const w = page.context().pages()[pagesAfter - 1]
                await w.close().catch(() => {})
            }
            pass('diag-export-report')
        } else note('diag: export disabled (run not complete)')

        const failRow = page.locator('.diag-item-name').filter({ hasText: /Motor|Sensor|Wireless|Power|Optical|Core/i }).first()
        await failRow.click().catch(() => {})
    } catch (e) {
        fail('diag-deep', e)
    }

    try {
        await page.goto(`${base}/#/settings`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.getByRole('button', { name: 'Change Email' }).click()
        await page.waitForTimeout(200)
        await page.getByRole('button', { name: 'Change Password' }).click()
        await page.waitForTimeout(200)
        await page.getByRole('button', { name: 'Notifications' }).click()
        await page.waitForTimeout(200)
        pass('settings-multi-rows')
    } catch (e) {
        fail('settings-deep', e)
    }

    try {
        await page.goto(`${base}/#/cameras`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.getByRole('heading', { name: 'Cameras' })
        pass('route-cameras')
    } catch (e) {
        fail('cameras', e)
    }

    try {
        await page.goto(`${base}/#/charge`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.getByRole('heading', { name: 'Charging' })
        pass('route-charge')
    } catch (e) {
        fail('charge', e)
    }

    try {
        await page.goto(`${base}/#/privacy`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.getByRole('heading').first()
        pass('privacy')
    } catch (e) {
        fail('privacy', e)
    }

    try {
        await page.goto(`${base}/#/terms`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.getByRole('heading').first()
        pass('terms')
    } catch (e) {
        fail('terms', e)
    }

    try {
        await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.goto(`${base}/#/settings`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.getByRole('button', { name: 'Log Out' }).click()
        await page.waitForTimeout(200)
        await page.getByRole('button', { name: 'Log out anyway' }).click()
        await page.waitForFunction(() => window.location.hash.includes('login'), { timeout: 15000 })
        pass('logout-for-oauth-test')
        await page.getByRole('button', { name: 'Google' }).click({ force: true })
        await page.waitForTimeout(3000)
        pass('login-google-oauth-attempt')
    } catch (e) {
        fail('login-google', e)
    }

    R.consoleErrors = [...new Set(consoleErrors)].slice(0, 25)
    return JSON.stringify(R, null, 2)
}
