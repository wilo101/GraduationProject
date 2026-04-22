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
import './styles/manual-override.css'
import './styles/diagnostics.css'
import './styles/ops-ui.css'
import './styles/tablet-responsive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
