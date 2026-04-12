import React, { useCallback, useEffect, useRef, useState } from 'react'

import logo from '../assets/afr-logo.png'

const SPLASH_PHOTO = 'https://picsum.photos/seed/augustus-splash/1600/1200'

const STEPS = [
    'Loading system modules…',
    'Checking network link…',
    'Syncing sensor baseline…',
]

export default function SplashScreen({
    onDone,
    stepMs = 800,
    gapMs = 150,
    holdMs = 200,
    fadeMs = 500,
}) {
    const [visible, setVisible] = useState(true)
    const [isExiting, setIsExiting] = useState(false)
    const [widths, setWidths] = useState([0, 0, 0])
    const [stepIndex, setStepIndex] = useState(0)

    const onDoneRef = useRef(onDone)
    const skipRef = useRef(false)
    const finishedRef = useRef(false)

    useEffect(() => {
        onDoneRef.current = onDone
    }, [onDone])

    const finish = useCallback(() => {
        if (finishedRef.current) return
        finishedRef.current = true
        setVisible(false)
        if (onDoneRef.current) onDoneRef.current()
    }, [])

    const handleSkip = useCallback(() => {
        skipRef.current = true
        setIsExiting(true)
        setTimeout(finish, Math.min(180, fadeMs))
    }, [fadeMs, finish])

    useEffect(() => {
        let mounted = true
        const timeouts = []

        const wait = (ms) =>
            new Promise((resolve) => {
                const id = setTimeout(resolve, ms)
                timeouts.push(id)
            })

        const runSequence = async () => {
            await wait(50)
            if (!mounted || skipRef.current) return

            setStepIndex(0)
            setWidths((w) => [100, w[1], w[2]])
            await wait(stepMs)
            if (!mounted || skipRef.current) return

            await wait(gapMs)
            if (!mounted || skipRef.current) return

            setStepIndex(1)
            setWidths((w) => [100, 100, w[2]])
            await wait(stepMs)
            if (!mounted || skipRef.current) return

            await wait(gapMs)
            if (!mounted || skipRef.current) return

            setStepIndex(2)
            setWidths((w) => [100, 100, 100])
            await wait(stepMs)
            if (!mounted || skipRef.current) return

            await wait(holdMs)
            if (!mounted || skipRef.current) return

            setIsExiting(true)
            await wait(fadeMs + 50)
            if (!mounted || skipRef.current) return

            finish()
        }

        runSequence()

        return () => {
            mounted = false
            timeouts.forEach(clearTimeout)
        }
    }, [stepMs, gapMs, holdMs, fadeMs, finish])

    if (!visible) return null

    const pct = Math.round(((stepIndex + 1) / STEPS.length) * 100)

    return (
        <div
            className={`splash-screen${isExiting ? ' splash-screen--exiting' : ''}`}
            style={{
                '--splash-photo': `url(${SPLASH_PHOTO})`,
                transition: `opacity ${fadeMs}ms ease-out`,
                opacity: isExiting ? 0 : 1,
            }}
            role="dialog"
            aria-busy="true"
            aria-live="polite"
            aria-label="Augustus OS startup"
        >
            <div className="splash-screen__photo" aria-hidden />
            <div className="splash-screen__mesh" aria-hidden />
            <div className="splash-screen__grid" aria-hidden />
            <div className="splash-screen__ambient splash-screen__ambient--tl" aria-hidden />
            <div className="splash-screen__ambient splash-screen__ambient--br" aria-hidden />

            <button type="button" className="splash-skip" onClick={handleSkip}>
                Skip
            </button>

            <div className="splash-screen__inner splash-screen__enter" lang="en">
                <div className="splash-panel">
                    <div className="splash-logo-wrap">
                        <img className="splash-logo" src={logo} alt="Augustus OS" />
                    </div>

                    <header>
                        <h1 className="splash-brand">Augustus OS</h1>
                        <p className="splash-tagline">Starting the console. Safe to wait a few seconds.</p>
                    </header>

                    <div className="splash-progress">
                        <div className="splash-progress__row">
                            <span className="splash-progress__step" id="splash-step-label">
                                {STEPS[Math.min(stepIndex, STEPS.length - 1)]}
                            </span>
                            <span className="splash-progress__pct">{pct}%</span>
                        </div>

                        <div className="splash-bars" aria-hidden>
                            {widths.map((w, idx) => (
                                <div key={idx} className="splash-bar-track">
                                    <div
                                        className="splash-bar-fill"
                                        style={{
                                            width: `${w}%`,
                                            transitionDuration: `${stepMs}ms`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
