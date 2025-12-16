import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import DeployRobot from './pages/DeployRobot'
import Account from './pages/Account'
import Login from './pages/Login'
import SplashScreen from './components/SplashScreen'

// Placeholder Pages for future implementation
const Cameras = () => <div style={{ padding: '4rem', textAlign: 'center' }}><h1>Cameras</h1><p>Additional camera feeds...</p></div>
const MapView = () => <div style={{ padding: '4rem', textAlign: 'center' }}><h1>Map View</h1><p>Full house map...</p></div>
const Charge = () => <div style={{ padding: '4rem', textAlign: 'center' }}><h1>Charging</h1><p>Battery and dock status...</p></div>

function App() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <>
            {isLoading && <SplashScreen onDone={() => setIsLoading(false)} />}
            <Router>
                <Routes>
                    {/* Public Route - No Layout */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes - Main Layout */}
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="settings" element={<Settings />} />

                        {/* Routes matching new Sidebar items */}
                        <Route path="cameras" element={<Cameras />} />
                        <Route path="deploy" element={<DeployRobot />} />
                        <Route path="map-view" element={<MapView />} />
                        {/* Charge removed per request, kept placeholder if needed or remove entirely.
                        User asked to replace Charge with Account.
                    */}
                        <Route path="account" element={<Account />} />
                        <Route path="charge" element={<Charge />} />
                        {/* Route kept for safety, but sidebar link removed */}

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </Router>
        </>
    )
}

export default App
