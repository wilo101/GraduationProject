import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const MainLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                marginLeft: '80px', /* Match new sidebar */
                flex: 1,
                padding: '3rem',
                minHeight: '100vh',
                maxWidth: '1440px' /* Constrain width for better UX on large screens */
            }}>
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout
