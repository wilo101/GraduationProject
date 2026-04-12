import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Map, Cpu, ShieldCheck } from 'lucide-react'
import AuthBrandPanel from './AuthBrandPanel'

export default function AuthScreenShell({ children }) {
    const { t, i18n } = useTranslation()
    const dir = i18n.language?.startsWith('ar') ? 'rtl' : 'ltr'

    const highlights = [
        { key: 'h1', icon: Map },
        { key: 'h2', icon: Cpu },
        { key: 'h3', icon: ShieldCheck },
    ]

    return (
        <div className="auth-shell auth-shell--3d fade-in">
            <div className="auth-shell__stage" aria-hidden>
                <div className="auth-shell__stage-bg" />
                <div className="auth-shell__stage-fog" />
                <div className="auth-shell__stage-weave" />
                <div className="auth-shell__stage-grid" />
                <div className="auth-shell__stage-sheen" />
                <div className="auth-shell__stage-grain" />
                <div className="auth-shell__stage-grain auth-shell__stage-grain--fine" />
            </div>

            <a href="#auth-form" className="skip-link">
                Skip to form
            </a>

            <div className="auth-shell__layout" dir={dir}>
                <aside className="auth-shell__brand">
                    <AuthBrandPanel t={t} highlights={highlights} />
                </aside>

                <div className="auth-shell__main">
                    <div className="auth-card">{children}</div>

                    <nav className="auth-legal" aria-label="Legal">
                        <Link to="/privacy">Privacy policy</Link>
                        <span aria-hidden>·</span>
                        <Link to="/terms">Terms of service</Link>
                    </nav>
                </div>
            </div>
        </div>
    )
}
