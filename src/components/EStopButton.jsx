import React, { useEffect, useMemo, useState } from 'react'
import { OctagonX } from 'lucide-react'

export default function EStopButton() {
    const [armed, setArmed] = useState(false)
    const [lastAction, setLastAction] = useState(null)

    const canConfirm = useMemo(() => armed, [armed])

    useEffect(() => {
        if (!armed) return
        const t = setTimeout(() => setArmed(false), 4500)
        return () => clearTimeout(t)
    }, [armed])

    const trigger = () => {
        // Placeholder: later wire to ROS / WebSocket / API.
        setLastAction(new Date())
        setArmed(false)
    }

    const onClick = () => {
        if (!armed) {
            setArmed(true)
            return
        }
        trigger()
    }

    return (
        <div style={{ position: 'fixed', top: 18, right: 18, zIndex: 9999 }}>
            <button
                type="button"
                onClick={onClick}
                aria-label={armed ? 'Confirm emergency stop' : 'Emergency stop'}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.85rem 1.05rem',
                    borderRadius: 14,
                    border: armed ? '1px solid rgba(239, 68, 68, 0.65)' : '1px solid rgba(239, 68, 68, 0.35)',
                    background: armed ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.14)',
                    color: '#fee2e2',
                    fontWeight: 850,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    boxShadow: armed ? '0 18px 46px rgba(239, 68, 68, 0.25)' : '0 14px 34px rgba(239, 68, 68, 0.16)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <OctagonX size={18} aria-hidden />
                {armed ? 'Confirm E‑Stop' : 'توقف طوارئ'}
            </button>

            {lastAction ? (
                <div
                    className="glass-card"
                    role="status"
                    style={{
                        marginTop: '0.5rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(226,232,240,0.9)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        background: 'rgba(22, 24, 32, 0.72)',
                    }}
                >
                    Sent at {lastAction.toLocaleTimeString()}
                </div>
            ) : null}
        </div>
    )
}

