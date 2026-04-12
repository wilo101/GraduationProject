import React from 'react'
import { Link } from 'react-router-dom'

export default function AuthScreenShell({ children }) {
    return (
        <div className="auth-shell fade-in">
            <a href="#auth-form" className="skip-link">
                Skip to form
            </a>

            <div className="auth-shell__ambient auth-shell__ambient--tr" aria-hidden />
            <div className="auth-shell__ambient auth-shell__ambient--bl" aria-hidden />

            <div className="auth-shell__main" lang="en">
                <div className="auth-card auth-reveal">{children}</div>

                <nav className="auth-legal" aria-label="Legal">
                    <Link to="/privacy">Privacy policy</Link>
                    <span aria-hidden>·</span>
                    <Link to="/terms">Terms of service</Link>
                </nav>
            </div>
        </div>
    )
}
