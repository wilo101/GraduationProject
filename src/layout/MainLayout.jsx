import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import OnboardingTour from '../components/OnboardingTour'
import AnimatedBlueGradients from '../components/AnimatedBlueGradients'
import { consumeSmoothAppEnter } from '../lib/appEnterTransition'

const THEME_KEY = 'augustus:theme'

const easeVelvet = [0.16, 1, 0.3, 1]

const MainLayout = () => {
    const reduce = useReducedMotion()
    const [enterSmooth] = useState(() => consumeSmoothAppEnter())

    useEffect(() => {
        document.documentElement.dataset.theme = 'dark'
        window.localStorage.setItem(THEME_KEY, 'dark')
    }, [])

    return (
        <motion.div
            className="main-layout-root"
            initial={enterSmooth && !reduce ? { opacity: 0, y: 18 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: reduce ? 0.2 : 0.65,
                ease: easeVelvet,
            }}
            style={{
                display: 'flex',
                minHeight: '100dvh',
                position: 'relative',
                zIndex: 1,
                willChange: enterSmooth && !reduce ? 'opacity, transform' : undefined,
            }}
        >
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
        </motion.div>
    )
}

export default MainLayout
