import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const TOUR_KEY = 'onboarding:tour:v1:done'

const STEPS = [
    {
        id: 'sidebar',
        selector: '.sidebar-dock__nav',
        title: 'Sidebar navigation',
        text: 'Use this dock to jump between Overview, Map, Deploy, Diagnostics, and Settings.',
    },
    {
        id: 'engage',
        selector: '[data-tour="engage-btn"]',
        route: '/deploy',
        title: 'ENGAGE control',
        text: 'Open control and press ENGAGE only when connection status is strong.',
    },
    {
        id: 'map',
        selector: '[data-tour="nav-map"]',
        title: 'Map access',
        text: 'Open Map for site zones, dispatch, and patrol routing.',
    },
    {
        id: 'diag',
        selector: '[data-tour="nav-diagnostics"]',
        title: 'Diagnostics page',
        text: 'Run subsystem checks and inspect failures from Diagnostics.',
    },
]

export default function OnboardingTour() {
    const [open, setOpen] = useState(false)
    const [stepIdx, setStepIdx] = useState(0)
    const [targetRect, setTargetRect] = useState(null)
    const [missingCount, setMissingCount] = useState(0)
    const location = useLocation()
    const navigate = useNavigate()

    const step = STEPS[stepIdx]
    const isLast = stepIdx >= STEPS.length - 1

    useEffect(() => {
        try {
            const done = localStorage.getItem(TOUR_KEY) === 'true'
            if (!done) setOpen(true)
        } catch {
            // If storage is unavailable, don't block UI with onboarding.
            setOpen(false)
        }
    }, [])

    useEffect(() => {
        if (!open || !step) return
        if (step.route && location.pathname !== step.route) navigate(step.route)
    }, [open, step, location.pathname, navigate])

    useEffect(() => {
        if (!open || !step) return
        const updateRect = () => {
            const node = document.querySelector(step.selector)
            if (!node) {
                setTargetRect(null)
                setMissingCount((c) => c + 1)
                return
            }
            setMissingCount(0)
            const r = node.getBoundingClientRect()
            setTargetRect({ top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height })
        }
        updateRect()
        window.addEventListener('resize', updateRect)
        window.addEventListener('scroll', updateRect, true)
        const t = window.setInterval(updateRect, 350)
        return () => {
            window.removeEventListener('resize', updateRect)
            window.removeEventListener('scroll', updateRect, true)
            window.clearInterval(t)
        }
    }, [open, step])

    useEffect(() => {
        if (!open) return
        // If target never appears, don't leave a blocking state.
        if (missingCount > 6) {
            if (isLast) {
                localStorage.setItem(TOUR_KEY, 'true')
                setOpen(false)
            } else {
                setStepIdx((i) => i + 1)
                setMissingCount(0)
            }
        }
    }, [missingCount, open, isLast])

    const tooltipStyle = useMemo(() => {
        if (!targetRect) {
            return {
                position: 'fixed',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
            }
        }
        const left = Math.min(window.innerWidth - 320, targetRect.right + 14)
        const top = Math.max(16, Math.min(window.innerHeight - 180, targetRect.top))
        return { position: 'fixed', left, top }
    }, [targetRect])

    if (!open) return null

    const close = () => {
        try {
            localStorage.setItem(TOUR_KEY, 'true')
        } catch {
            // ignore
        }
        setOpen(false)
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1300,
                background: 'var(--onboarding-scrim)',
                pointerEvents: 'none',
            }}
        >
            {targetRect ? (
                <div
                    aria-hidden
                    style={{
                        position: 'fixed',
                        left: targetRect.left - 4,
                        top: targetRect.top - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                        borderRadius: 14,
                        border: '1px solid var(--onboarding-spot-border)',
                        boxShadow: 'var(--onboarding-spot-shadow)',
                        pointerEvents: 'none',
                    }}
                />
            ) : null}
            <div className="glass-panel" style={{ ...tooltipStyle, width: 300, borderRadius: 14, padding: '0.85rem 0.9rem', pointerEvents: 'auto' }}>
                <div style={{ fontWeight: 850 }}>{step?.title}</div>
                <div style={{ marginTop: '0.35rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{step?.text}</div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Step {stepIdx + 1}/{STEPS.length}
                    </div>
                    <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button type="button" className="auth-social-btn" onClick={close} style={{ width: 'auto', padding: '0.4rem 0.6rem' }}>
                            Skip
                        </button>
                        <button
                            type="button"
                            className="auth-primary-btn"
                            style={{ width: 'auto', padding: '0.4rem 0.6rem' }}
                            onClick={() => {
                                if (isLast) close()
                                else setStepIdx((i) => i + 1)
                            }}
                        >
                            {isLast ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

