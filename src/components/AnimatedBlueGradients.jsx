import React from 'react'
import { motion } from 'framer-motion'

const blobBase = {
    position: 'fixed',
    borderRadius: '50%',
    filter: 'blur(78px)',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
}

export default function AnimatedBlueGradients() {
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
                    background: 'radial-gradient(circle at 38% 42%, rgba(82, 155, 255, 0.26), rgba(31, 87, 173, 0.06) 58%, transparent 76%)',
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
                    background: 'radial-gradient(circle at 50% 50%, rgba(69, 139, 255, 0.22), rgba(21, 67, 141, 0.05) 62%, transparent 78%)',
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

