import React, { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Settings, Map, Zap, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logo from '../assets/afr-logo.png'

const ICON_STROKE = 1.65
const ICON_SIZE = 22

export default function Sidebar() {
    const { t } = useTranslation()

    const navItems = useMemo(() => [
        { icon: Home, label: t('nav.overview'), path: '/' },
        { icon: Map, label: t('nav.map'), path: '/map-view' },
        { icon: Zap, label: t('nav.deploy'), path: '/deploy' },
        { icon: Shield, label: t('nav.diagnostics'), path: '/diagnostics' },
        { icon: Settings, label: t('nav.settings'), path: '/settings' },
    ], [t])

    return (
        <aside className="sidebar-dock" aria-label="Main navigation">
            <div className="sidebar-dock__mark">
                <NavLink to="/" end className="sidebar-dock__mark-btn" aria-label={t('nav.overview')} title={t('nav.overview')}>
                    <img src={logo} alt="" width={44} height={44} aria-hidden />
                </NavLink>
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

            <div className="sidebar-dock__foot" aria-hidden>
                <div className="sidebar-dock__foot-line" />
                <div className="sidebar-dock__foot-dot" />
            </div>
        </aside>
    )
}
