import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import logo from '../assets/afr-logo.png'

const easeVelvet = [0.16, 1, 0.3, 1]

export default function OutroScreen() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return
            
            const target = e.target
            const tag = target?.tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return

            if (e.key === 'q' || e.key === 'Q') {
                e.preventDefault()
                setOpen(true)
            }
            if (e.key === 'Escape' && open) {
                setOpen(false)
            }
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [open])

    useEffect(() => {
        if (!open || typeof document === 'undefined') return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])

    const node = (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="outro-screen-root"
                    className="outro-screen-portal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: easeVelvet }}
                    aria-live="assertive"
                >
                    <div className="auth-shell auth-shell--3d" style={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none', background: '#04060c' }} aria-hidden>
                        <div className="auth-shell__stage">
                            <div className="auth-shell__stage-bg" />
                            <div className="auth-shell__stage-fog" />
                            <div className="auth-shell__stage-weave" />
                            <div className="auth-shell__stage-grid" />
                            <div className="auth-shell__stage-sheen" />
                            <div className="auth-shell__stage-grain" />
                            <div className="auth-shell__stage-grain auth-shell__stage-grain--fine" />
                        </div>
                    </div>

                    <div className="outro-screen-content">
                        <motion.div
                            className="outro-screen__logo-wrap"
                            initial={{ opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 0.9, delay: 0.3, ease: easeVelvet }}
                        >
                            <img src={logo} alt="Augustus OS" className="outro-screen__logo" />
                        </motion.div>

                        <motion.h2
                            className="outro-screen__brand"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6, ease: easeVelvet }}
                        >
                            Augustus OS
                        </motion.h2>

                        <motion.div
                            className="outro-screen__line"
                            initial={{ scaleY: 0, opacity: 0 }}
                            animate={{ scaleY: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 1.0, ease: easeVelvet }}
                        />

                        <motion.h1
                            className="outro-screen__thankyou"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.5, ease: easeVelvet }}
                        >
                            Thank You
                        </motion.h1>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    if (typeof document === 'undefined') return null
    return createPortal(node, document.body)
}
