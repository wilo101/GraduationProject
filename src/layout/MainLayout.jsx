import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import OnboardingTour from '../components/OnboardingTour'
import AnimatedBlueGradients from '../components/AnimatedBlueGradients'

const THEME_KEY = 'augustus:theme'

const MainLayout = () => {
    const [theme, setTheme] = useState('dark')
    const [bubble, setBubble] = useState(null)

    useEffect(() => {
        const saved = window.localStorage.getItem(THEME_KEY)
        const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches
        setTheme(saved === 'light' || saved === 'dark' ? saved : prefersLight ? 'light' : 'dark')
    }, [])

    useEffect(() => {
        document.documentElement.dataset.theme = theme
        window.localStorage.setItem(THEME_KEY, theme)
    }, [theme])

    const toggleTheme = (e) => {
        const next = theme === 'dark' ? 'light' : 'dark'
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

        if (reduced) {
            setTheme(next)
            return
        }

        const rect = e.currentTarget.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
        const color = next === 'light' ? '#d8e3ee' : '#090c12'

        const applyTheme = () => {
            document.documentElement.dataset.theme = next
            setTheme(next)
        }

        setBubble({ x, y, radius, color, active: false })
        requestAnimationFrame(() => {
            setBubble((cur) => (cur ? { ...cur, active: true } : cur))
            requestAnimationFrame(() => {
                if (typeof document.startViewTransition === 'function') {
                    document.startViewTransition(applyTheme)
                } else {
                    applyTheme()
                }
            })
        })
        /* Clear bubble after expand + crossfade (--theme-crossfade-duration + buffer) */
        window.setTimeout(() => setBubble(null), 950)
    }

    return (
        <div style={{ display: 'flex', minHeight: '100dvh', position: 'relative', zIndex: 1 }}>
            {theme === 'dark' ? <AnimatedBlueGradients /> : null}
            {bubble ? (
                <div
                    aria-hidden
                    className={`theme-bubble${bubble.active ? ' theme-bubble--active' : ''}`}
                    style={{
                        left: bubble.x,
                        top: bubble.y,
                        width: bubble.radius * 2,
                        height: bubble.radius * 2,
                        background: bubble.color,
                    }}
                />
            ) : null}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>
            <Sidebar />
            <main id="main-content" lang="en" tabIndex={-1} className="main-shell">
                <button
                    type="button"
                    className="theme-toggle"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    onClick={toggleTheme}
                >
                    {theme === 'dark' ? <Sun size={17} aria-hidden /> : <Moon size={17} aria-hidden />}
                    <span>{theme === 'dark' ? 'Light' : 'Night'}</span>
                </button>
                <div className="main-shell__outlet">
                    <Outlet />
                </div>
            </main>
            <OnboardingTour />
        </div>
    )
}

export default MainLayout
