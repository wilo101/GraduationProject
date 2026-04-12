import React, { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Settings, Map, Zap, Shield } from 'lucide-react'
import logo from '../assets/afr-logo.png'

const ICON_STROKE = 1.65
const ICON_SIZE = 22

const navItems = [
    { icon: Home, label: 'Overview', path: '/' },
    { icon: Map, label: 'Map', path: '/map-view' },
    { icon: Zap, label: 'Deploy', path: '/deploy' },
    { icon: Shield, label: 'فحص النظام', path: '/diagnostics' },
    { icon: Settings, label: 'الإعدادات', path: '/settings' },
]

export default function Sidebar() {
    const [estopOpen, setEstopOpen] = useState(false)
    const [lastEStopAt, setLastEStopAt] = useState(null)

    const estopLabel = useMemo(() => 'توقف طوارئ', [])

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setEstopOpen(false)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    const executeEStop = () => {
        // Placeholder: later wire to ROS / WebSocket / API.
        const now = new Date()
        setLastEStopAt(now)
        window.dispatchEvent(new CustomEvent('robot:estop', { detail: { at: now.toISOString() } }))
        setEstopOpen(false)
    }

    return (
        <aside className="sidebar-dock" aria-label="Main navigation">
            <div className="sidebar-dock__mark">
                <img src={logo} alt="أوجوستوس" width={44} height={44} />
            </div>

            <div className="sidebar-dock__rule" aria-hidden />

            <nav className="sidebar-dock__nav" aria-label="Primary">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                            `sidebar-nav__link${isActive ? ' sidebar-nav__link--active' : ''}`
                        }
                        aria-label={item.label}
                        data-tour={
                            item.path === '/map-view'
                                ? 'nav-map'
                                : item.path === '/diagnostics'
                                  ? 'nav-diagnostics'
                                  : undefined
                        }
                    >
                        <span className="sidebar-nav__icon" aria-hidden>
                            <item.icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                        </span>
                        <span className="sidebar-nav__tip">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* E-Stop pinned bottom (does not change nav layout) */}
            <div className="sidebar-dock__estop">
                <button
                    type="button"
                    className="sidebar-nav__link sidebar-nav__link--estop"
                    onClick={() => setEstopOpen(true)}
                    aria-label={estopLabel}
                    data-tour="estop-btn"
                >
                    <span className="sidebar-nav__icon" aria-hidden>
                        <span className="sidebar-estop__glyph">⏹</span>
                    </span>
                    <span className="sidebar-nav__tip">{estopLabel}</span>
                </button>
                {lastEStopAt ? (
                    <div className="sidebar-estop__meta" aria-hidden>
                        {lastEStopAt.toLocaleTimeString()}
                    </div>
                ) : null}
            </div>

            <div className="sidebar-dock__foot" aria-hidden>
                <div className="sidebar-dock__foot-line" />
                <div className="sidebar-dock__foot-dot" />
            </div>

            {estopOpen ? (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Confirm emergency stop"
                    className="sidebar-estop__modal-backdrop"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setEstopOpen(false)
                    }}
                >
                    <div className="sidebar-estop__modal glass-panel">
                        <div className="sidebar-estop__modal-title">
                            <span className="sidebar-estop__modal-icon" aria-hidden>
                                ⏹
                            </span>
                            Confirm Emergency Stop
                        </div>
                        <div className="sidebar-estop__modal-sub">
                            This will immediately stop robot movement. Continue?
                        </div>
                        <div className="sidebar-estop__modal-actions">
                            <button type="button" className="auth-social-btn" onClick={() => setEstopOpen(false)}>
                                Cancel
                            </button>
                            <button type="button" className="sidebar-estop__confirm" onClick={executeEStop}>
                                Stop now
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </aside>
    )
}
