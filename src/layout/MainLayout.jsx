import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Moon, Sun, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/Sidebar'
import OnboardingTour from '../components/OnboardingTour'
import AnimatedBlueGradients from '../components/AnimatedBlueGradients'

const THEME_KEY = 'augustus:theme'

const MainLayout = () => {
    const { t, i18n } = useTranslation()
    useEffect(() => {
        document.documentElement.dataset.theme = 'dark'
        window.localStorage.setItem(THEME_KEY, 'dark')
    }, [])

    return (
        <div style={{ display: 'flex', minHeight: '100dvh', position: 'relative', zIndex: 1 }}>
            <AnimatedBlueGradients />
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>
            <Sidebar />
            <main id="main-content" tabIndex={-1} className="main-shell">
                <div className="main-shell__outlet">
                    <Outlet />
                </div>
            </main>
            <OnboardingTour />
        </div>
    )
}

export default MainLayout
