import React from 'react'
import { AccountSettingsPanel } from './Account'

const Settings = () => {
    return (
        <div className="fade-in diag-page ops-page-wrap">
            <header className="diag-hero">
                <div>
                    <h1 className="diag-h1">Settings</h1>
                    <p className="diag-sub">
                        Account credentials, security, and operator preferences for this console.
                    </p>
                </div>
            </header>

            <div className="diag-ops-frame">
                <div className="diag-ops-frame__accent" aria-hidden />
                <section className="glass-panel diag-card settings-ops-card" aria-label="Account and preferences">
                    <AccountSettingsPanel embedded />
                </section>
            </div>
        </div>
    )
}

export default Settings
