/**
 * Real Supabase signUp (no VITE_E2E_AUTH). Uses .env.local keys.
 * baseUrl must match running dev server.
 */
async (page) => {
    const base = 'http://127.0.0.1:5173/GraduationProject'
    const out = { ok: false, steps: [], supabaseNetwork: [], formMessages: [], errors: [] }

    const uid = Date.now()
    /* Supabase treats some domains (e.g. example.com) as invalid — use a normal-looking domain. */
    const email = `pw.mega.${uid}@gmail.com`
    const password = 'TestPass888!'
    const fullName = 'Playwright Mega Test'

    page.on('response', async (res) => {
        const u = res.url()
        if (u.includes('supabase.co') && u.includes('auth')) {
            out.supabaseNetwork.push({ url: u.split('?')[0], status: res.status() })
        }
    })

    try {
        await page.goto(`${base}/#/register`, { waitUntil: 'domcontentloaded', timeout: 30000 })
        out.steps.push('goto-register')
        const skip = page.getByRole('button', { name: 'Skip' })
        if (await skip.isVisible().catch(() => false)) {
            await skip.click()
            out.steps.push('skip-splash')
        }

        const configured = await page.getByText(/VITE_SUPABASE_URL|not configured/i).isVisible().catch(() => false)
        if (configured) {
            out.errors.push('Supabase not configured banner visible')
            return JSON.stringify(out, null, 2)
        }

        await page.locator('#register-name').fill(fullName)
        await page.locator('#register-email').fill(email)
        await page.locator('#register-password').fill(password)
        out.steps.push('fill-form')

        await page.getByRole('button', { name: /create account|sign up/i }).click()
        out.steps.push('submit')

        await page.waitForTimeout(3500)

        const alerts = page.locator('[role="alert"]')
        const n = await alerts.count()
        for (let i = 0; i < n; i++) {
            const t = (await alerts.nth(i).innerText().catch(() => '')).trim()
            if (t) out.formMessages.push(t.slice(0, 500))
        }

        const hash = await page.evaluate(() => window.location.hash)
        out.finalHash = hash

        const authOk =
            hash === '#/' ||
            out.formMessages.some((m) => /confirm your email|check your email|signed up|verification/i.test(m)) ||
            out.supabaseNetwork.some((r) => r.status === 200 || r.status === 201)

        out.ok = authOk
        out.testEmail = email
        out.steps.push('done')
    } catch (e) {
        out.errors.push(String(e))
    }

    return JSON.stringify(out, null, 2)
}
