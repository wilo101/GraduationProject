/**
 * Phase 2: full page load restores VITE_E2E_AUTH session; exercise key controls.
 */
async (page) => {
    const base = 'http://127.0.0.1:5173/GraduationProject'
    const out = { passed: [], failed: [], notes: [] }

    async function skipSplash() {
        const skip = page.getByRole('button', { name: 'Skip' })
        if (await skip.isVisible().catch(() => false)) {
            await skip.click()
            await page.waitForTimeout(400)
        }
    }

    // Full document load (not hash-only) so AuthProvider remounts and VITE_E2E_AUTH reapplies after prior logout.
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 25000 })
    await skipSplash()
    await page.waitForTimeout(300)

    try {
        await page.goto(`${base}/#/deploy`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.waitForTimeout(2500)
        const engage = page.getByRole('button', { name: 'Engage' })
        if (await engage.isEnabled().catch(() => false)) {
            await engage.click()
            out.passed.push('deploy-engage')
        } else out.notes.push('deploy: Engage still disabled (link/latency sim)')
        const retry = page.getByRole('button', { name: 'Retry' })
        if (await retry.isVisible().catch(() => false)) {
            await retry.click()
            out.passed.push('deploy-camera-retry')
        }
    } catch (e) {
        out.failed.push({ check: 'deploy', reason: String(e) })
    }

    try {
        await page.goto(`${base}/#/diagnostics`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.getByRole('button', { name: 'Run all' }).click()
        await page.waitForTimeout(900)
        out.passed.push('diagnostics-run-all')
    } catch (e) {
        out.failed.push({ check: 'diagnostics', reason: String(e) })
    }

    try {
        await page.goto(`${base}/#/map-view`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.getByRole('button', { name: 'Zoom in' }).click()
        out.passed.push('map-zoom-in')
    } catch (e) {
        out.failed.push({ check: 'map', reason: String(e) })
    }

    try {
        await page.goto(`${base}/#/settings`, { waitUntil: 'domcontentloaded' })
        await skipSplash()
        await page.getByRole('button', { name: 'Change Email' }).click()
        await page.waitForTimeout(250)
        out.passed.push('settings-change-email-panel')
    } catch (e) {
        out.failed.push({ check: 'settings', reason: String(e) })
    }

    return JSON.stringify(out, null, 2)
}
