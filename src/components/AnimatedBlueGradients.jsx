import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const blobBase = {
    position: 'fixed',
    borderRadius: '50%',
    filter: 'blur(78px)',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
}

/** Static blobs — same mood, no infinite animation (better on tablet GPU). */
function StaticBlueGradients() {
    const blob = {
        position: 'fixed',
        borderRadius: '50%',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        filter: 'blur(44px)',
        willChange: 'auto',
    }
    return (
        <div
            aria-hidden
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    ...blob,
                    width: 'min(48vw, 520px)',
                    height: 'min(48vw, 520px)',
                    minWidth: 280,
                    minHeight: 280,
                    top: '-18%',
                    left: '-14%',
                    opacity: 0.4,
                    background:
                        'radial-gradient(circle at 38% 42%, rgba(82, 155, 255, 0.26), rgba(31, 87, 173, 0.06) 58%, transparent 76%)',
                }}
            />
            <div
                style={{
                    ...blob,
                    width: 'min(42vw, 460px)',
                    height: 'min(42vw, 460px)',
                    minWidth: 260,
                    minHeight: 260,
                    bottom: '-20%',
                    right: '-12%',
                    opacity: 0.3,
                    background:
                        'radial-gradient(circle at 50% 50%, rgba(69, 139, 255, 0.22), rgba(21, 67, 141, 0.05) 62%, transparent 78%)',
                }}
            />
        </div>
    )
}

export default function AnimatedBlueGradients() {
    const reduceMotion = useReducedMotion()
    const [coarsePointer, setCoarsePointer] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return undefined
        const mq = window.matchMedia('(pointer: coarse)')
        const sync = () => setCoarsePointer(mq.matches)
        sync()
        mq.addEventListener('change', sync)
        return () => mq.removeEventListener('change', sync)
    }, [])

    if (reduceMotion || coarsePointer) {
        return <StaticBlueGradients />
    }

    return (
        <div
            aria-hidden
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'hidden',
            }}
        >
            <motion.div
                style={{
                    ...blobBase,
                    width: '48vw',
                    height: '48vw',
                    minWidth: 360,
                    minHeight: 360,
                    maxWidth: 780,
                    maxHeight: 780,
                    top: '-18%',
                    left: '-14%',
                    background:
                        'radial-gradient(circle at 38% 42%, rgba(82, 155, 255, 0.26), rgba(31, 87, 173, 0.06) 58%, transparent 76%)',
                }}
                animate={{
                    x: [0, 28, -14, 0],
                    y: [0, 22, 36, 0],
                    scale: [1, 1.06, 0.98, 1],
                    opacity: [0.36, 0.46, 0.34, 0.36],
                }}
                transition={{
                    duration: 24,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                style={{
                    ...blobBase,
                    width: '42vw',
                    height: '42vw',
                    minWidth: 340,
                    minHeight: 340,
                    maxWidth: 700,
                    maxHeight: 700,
                    bottom: '-20%',
                    right: '-12%',
                    background:
                        'radial-gradient(circle at 50% 50%, rgba(69, 139, 255, 0.22), rgba(21, 67, 141, 0.05) 62%, transparent 78%)',
                }}
                animate={{
                    x: [0, -24, 12, 0],
                    y: [0, -18, -30, 0],
                    scale: [1, 0.97, 1.05, 1],
                    opacity: [0.28, 0.37, 0.25, 0.28],
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
        </div>
    )
}
