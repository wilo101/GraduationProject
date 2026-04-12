import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AuthScreenShell from '../components/AuthScreenShell'

export default function AuthLayout() {
    const location = useLocation()

    return (
        <AuthScreenShell>
            <div className="auth-transition-root">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={location.pathname}
                        className="auth-card-motion"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </div>
        </AuthScreenShell>
    )
}
