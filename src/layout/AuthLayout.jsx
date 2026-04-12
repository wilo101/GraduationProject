import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import AuthScreenShell from '../components/AuthScreenShell'

const easeSmooth = [0.22, 1, 0.36, 1]

export default function AuthLayout() {
    const location = useLocation()
    const reduceMotion = useReducedMotion()

    const enter = reduceMotion ? 0.12 : 0.38
    const exit = reduceMotion ? 0.1 : 0.32

    return (
        <AuthScreenShell>
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={location.pathname}
                    className="auth-card-motion"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                        reduceMotion
                            ? { opacity: 0, transition: { duration: exit } }
                            : {
                                  opacity: 0,
                                  y: -10,
                                  transition: { duration: exit, ease: easeSmooth },
                              }
                    }
                    transition={{ duration: enter, ease: easeSmooth }}
                    style={{ willChange: reduceMotion ? undefined : 'opacity, transform' }}
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
        </AuthScreenShell>
    )
}
