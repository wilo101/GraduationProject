import React, { useEffect, useRef, useState } from "react";
import logo from "../assets/afr-logo.png";

const STEPS = [
    "Initializing Core Systems...",
    "Establishing Secure Uplink...",
    "Calibrating Sensors...",
];

export default function SplashScreen({
    onDone,
    stepMs = 800,
    gapMs = 150,
    holdMs = 200,
    fadeMs = 500,
}) {
    const [visible, setVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [widths, setWidths] = useState([0, 0, 0]);
    const [stepIndex, setStepIndex] = useState(0);

    // Store onDone in ref to access fresh value without triggering re-effects
    const onDoneRef = useRef(onDone);
    useEffect(() => {
        onDoneRef.current = onDone;
    }, [onDone]);

    useEffect(() => {
        let mounted = true;
        const timeouts = [];

        const wait = (ms) => new Promise(resolve => {
            const id = setTimeout(resolve, ms);
            timeouts.push(id);
        });

        const runSequence = async () => {
            // Initial delay
            await wait(50);
            if (!mounted) return;

            // Step 1 (Index 0)
            setStepIndex(0);
            setWidths(w => [100, w[1], w[2]]);
            await wait(stepMs);
            if (!mounted) return;

            await wait(gapMs);
            if (!mounted) return;

            // Step 2 (Index 1)
            setStepIndex(1);
            setWidths(w => [100, 100, w[2]]);
            await wait(stepMs);
            if (!mounted) return;

            await wait(gapMs);
            if (!mounted) return;

            // Step 3 (Index 2)
            setStepIndex(2);
            setWidths(w => [100, 100, 100]);
            await wait(stepMs);
            if (!mounted) return;

            // Hold
            await wait(holdMs);
            if (!mounted) return;

            // Exit
            setIsExiting(true);
            await wait(fadeMs + 50);
            if (!mounted) return;

            setVisible(false);
            if (onDoneRef.current) onDoneRef.current();
        };

        runSequence();

        return () => {
            mounted = false;
            timeouts.forEach(clearTimeout);
        };
    }, [stepMs, gapMs, holdMs, fadeMs]); // Dependencies that configure timing

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label="Initializing Augustus OS"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1200,
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                background: 'var(--bg-deep)',
                backgroundImage: 'var(--bg-gradient)',
                transition: `opacity ${fadeMs}ms ease-out`,
                opacity: isExiting ? 0 : 1,
            }}
        >
            {/* Ambient Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-20%',
                width: '70vw',
                height: '70vw',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 60%)',
                filter: 'blur(100px)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* Grid Background Pattern */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.1,
                pointerEvents: 'none',
                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                zIndex: 1
            }} />

            <div style={{
                position: 'relative',
                display: 'flex',
                width: 'min(400px, 90vw)',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                padding: '2rem',
                textAlign: 'center',
                zIndex: 2
            }}>
                {/* Logo Section */}
                <div style={{
                    position: 'relative',
                    height: '6rem',
                    width: '6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Pulse Glow */}
                    <div className="animate-pulse" style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '9999px',
                        background: 'var(--glass-highlight)',
                        filter: 'blur(20px)',
                    }} />

                    <img
                        src={logo}
                        alt="Augustus Logo"
                        style={{
                            position: 'relative',
                            height: '5rem',
                            width: '5rem',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.3))'
                        }}
                    />
                </div>

                {/* Text Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-heading)'
                    }}>
                        AUGUSTUS OS
                    </h1>
                    <p style={{
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-body)',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontWeight: 500
                    }}>
                        System Initialization
                    </p>
                </div>

                {/* Progress Section */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-muted)'
                    }}>
                        <span>{STEPS[Math.min(stepIndex, STEPS.length - 1)]}</span>
                        <span>{Math.round(((stepIndex + 1) / 3) * 100)}%</span>
                    </div>

                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem' }}>
                        {widths.map((w, idx) => (
                            <div
                                key={idx}
                                style={{
                                    position: 'relative',
                                    height: '4px',
                                    flex: 1,
                                    overflow: 'hidden',
                                    borderRadius: '9999px',
                                    background: 'rgba(255,255,255,0.1)'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: '0 auto 0 0',
                                        height: '100%',
                                        backgroundColor: 'var(--accent-primary)',
                                        borderRadius: '9999px',
                                        width: `${w}%`,
                                        boxShadow: '0 0 10px rgba(255,255,255,0.5)',
                                        transition: `width ${stepMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pulse Animation Definition */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
