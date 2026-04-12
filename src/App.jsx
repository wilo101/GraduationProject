import React, { useState } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import DeployRobot from './pages/DeployRobot'
import MapView from './pages/MapView'
import SystemDiagnostics from './pages/SystemDiagnostics'
import Login from './pages/Login'
import Register from './pages/Register'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import SplashScreen from './components/SplashScreen'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import './styles/theme-light-overrides.css'

// Placeholder Pages for future implementation
const Cameras = () => (
    <div className="fade-in ops-page-wrap" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Cameras</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Additional camera feeds…</p>
    </div>
)
const Charge = () => (
    <div className="fade-in ops-page-wrap" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Charging</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Battery and dock status…</p>
    </div>
)

function App() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <AuthProvider>
            {isLoading && <SplashScreen onDone={() => setIsLoading(false)} />}
            {!isLoading && (
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <MainLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="diagnostics" element={<SystemDiagnostics />} />

                        {/* Routes matching new Sidebar items */}
                        <Route path="cameras" element={<Cameras />} />
                        <Route path="deploy" element={<DeployRobot />} />
                        <Route path="map-view" element={<MapView />} />
                        {/* Charge removed per request, kept placeholder if needed or remove entirely.
                        User asked to replace Charge with Account.
                    */}
                        <Route path="account" element={<Navigate to="/settings" replace />} />
                        <Route path="charge" element={<Charge />} />
                        {/* Route kept for safety, but sidebar link removed */}

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
            )}
        </AuthProvider>
    )
}

export default App
