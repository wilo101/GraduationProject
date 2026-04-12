import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import logo from '../assets/afr-logo.png'

const ease = [0.22, 1, 0.36, 1]

/**
 * Left auth column: same layout as before, with staggered 3D-style entrance
 * (logo → title → tagline → “At a glance” → each highlight).
 */
export default function AuthBrandPanel({ t, highlights }) {
    const reduce = useReducedMotion()

    const variants = useMemo(
        () => ({
            hidden: reduce
                ? { opacity: 0 }
                : { opacity: 0, rotateX: -14, y: 26 },
            visible: (delay = 0) => ({
                opacity: 1,
                rotateX: 0,
                y: 0,
                transition: {
                    delay: reduce ? 0 : delay,
                    duration: reduce ? 0.18 : 0.52,
                    ease,
                },
            }),
        }),
        [reduce],
    )

    const d = {
        logo: 0,
        title: 0.11,
        tagline: 0.22,
        heading: 0.36,
        h1: 0.5,
        h2: 0.62,
        h3: 0.74,
    }

    return (
        <div className="auth-shell__brand-inner auth-shell__brand-inner--3d">
            <header className="auth-shell__brand-header">
                <motion.div
                    className="auth-shell__brand-mark"
                    initial="hidden"
                    animate="visible"
                    variants={variants}
                    custom={d.logo}
                >
                    <img src={logo} alt="" width={56} height={56} />
                </motion.div>
                <div className="auth-shell__brand-copy">
                    <motion.h2
                        className="auth-shell__brand-title"
                        initial="hidden"
                        animate="visible"
                        variants={variants}
                        custom={d.title}
                    >
                        {t('auth_entry.brand_title')}
                    </motion.h2>
                    <motion.p
                        className="auth-shell__brand-lede"
                        initial="hidden"
                        animate="visible"
                        variants={variants}
                        custom={d.tagline}
                    >
                        {t('auth_entry.brand_tagline')}
                    </motion.p>
                </div>
            </header>

            <section className="auth-shell__brand-features" aria-labelledby="auth-brand-features-title">
                <motion.h3
                    id="auth-brand-features-title"
                    className="auth-shell__highlights-heading"
                    initial="hidden"
                    animate="visible"
                    variants={variants}
                    custom={d.heading}
                >
                    {t('auth_entry.highlights_heading')}
                </motion.h3>
                <ul className="auth-shell__highlights">
                    {highlights.map(({ key, icon: Ico }, i) => {
                        const delay = i === 0 ? d.h1 : i === 1 ? d.h2 : d.h3
                        return (
                            <motion.li
                                key={key}
                                className="auth-shell__highlight"
                                initial="hidden"
                                animate="visible"
                                variants={variants}
                                custom={delay}
                            >
                                <span className="auth-shell__highlight-ico" aria-hidden>
                                    <Ico size={20} strokeWidth={1.65} />
                                </span>
                                <span className="auth-shell__highlight-text">
                                    {t(`auth_entry.${key}`)}
                                </span>
                            </motion.li>
                        )
                    })}
                </ul>
            </section>
        </div>
    )
}
