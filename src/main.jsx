import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './i18n'
import './index.css'
/* Legacy component-kit tokens + optional class names (prefixed --cmp-*; does not override app theme) */
import './styles/variables.css'
import './styles/components.css'
import './styles/auth-screens.css'
import './styles/splash-screen.css'
import './styles/sidebar.css'
import './styles/touch-performance.css'
import './styles/manual-override.css'
import './styles/diagnostics.css'
import './styles/ops-ui.css'
import './styles/tablet-responsive.css'
import './styles/tablet-one-screen.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

if (typeof window !== 'undefined') {
    const standaloneMq = window.matchMedia('(display-mode: standalone)')
    const syncStandalone = () => {
        document.documentElement.dataset.pwaStandalone = standaloneMq.matches ? 'true' : 'false'
    }
    syncStandalone()
    if (typeof standaloneMq.addEventListener === 'function') {
        standaloneMq.addEventListener('change', syncStandalone)
    } else if (typeof standaloneMq.addListener === 'function') {
        standaloneMq.addListener(syncStandalone)
    }
}

if (import.meta.env.PROD && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
    })
}
