import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Battery, Thermometer, Droplets, Gauge, Activity } from 'lucide-react';

const StatusCard = ({
    type = 'generic',
    label,
    value,
    unit = '',
    maxValue = 100,
    threshold = 20,
    isInverseThreshold = false, // if true, Higher is worse (not used for battery/water usually, maybe temp?)
    onValueChange, // for slider
    updatedAt // optional: ms timestamp or Date
}) => {
    const mountedAtRef = useRef(Date.now())
    const [nowTick, setNowTick] = useState(Date.now())

    useEffect(() => {
        // Live-updating "Updated X min ago"
        let intervalMs = 15_000
        if (typeof window !== 'undefined' && window.matchMedia) {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) intervalMs = 60_000
            else if (window.matchMedia('(pointer: coarse)').matches) intervalMs = 45_000
        }
        const t = setInterval(() => setNowTick(Date.now()), intervalMs)
        return () => clearInterval(t)
    }, [])

    const updatedMs = useMemo(() => {
        if (updatedAt instanceof Date) return updatedAt.getTime()
        if (typeof updatedAt === 'number') return updatedAt
        return mountedAtRef.current
    }, [updatedAt])

    const updatedMinAgo = useMemo(() => {
        const diff = Math.max(0, nowTick - updatedMs)
        return Math.floor(diff / 60_000)
    }, [nowTick, updatedMs])

    // Determine Status
    const status = useMemo(() => {
        const numVal = parseFloat(value);
        if (type === 'pressure') return 'neutral'; // Manual control
        if (isInverseThreshold) {
            if (numVal >= threshold) return 'critical'
            if (numVal >= threshold * 0.85) return 'warning'
            return 'good'
        }
        if (numVal <= threshold) return 'critical';
        if (numVal <= threshold * 1.5) return 'warning';
        return 'good';
    }, [value, threshold, type, isInverseThreshold]);

    // Styles based on status
    const statusColors = {
        good: 'var(--status-good)',
        warning: 'var(--status-warning)',
        critical: 'var(--status-critical)',
        neutral: 'var(--status-neutral)'
    };

    const activeColor = statusColors[status];

    const Icon = useMemo(() => {
        switch (type) {
            case 'battery': return Battery;
            case 'temp': return Thermometer;
            case 'water': return Droplets;
            case 'pressure': return Gauge;
            default: return Activity;
        }
    }, [type]);

    return (
        <div className="glass-panel" style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            minHeight: '140px',
            position: 'relative',
            border: status === 'critical' ? '1px solid rgba(239, 68, 68, 0.5)' : undefined,
            boxShadow: status === 'critical' ? '0 0 20px rgba(239, 68, 68, 0.2)' : undefined
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: `var(--status-icon-bg, rgba(255,255,255,0.05))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: activeColor
                }}>
                    <Icon size={18} />
                </div>
                {status !== 'neutral' && (
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        color: activeColor, textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: 'var(--status-badge-bg, rgba(0,0,0,0.3))', padding: '0.2rem 0.5rem', borderRadius: 8
                    }}>
                        {status === 'good' ? 'Normal' : status === 'warning' ? (isInverseThreshold ? 'High' : 'Low') : 'Critical'}
                    </span>
                )}
            </div>

            {/* Value Area */}
            <div style={{ marginTop: 'auto' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--ops-metric-emphasis)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    {label}
                </h4>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span
                        className="numeric"
                        style={{
                            fontSize: '1.75rem',
                            fontWeight: 600,
                            color: 'var(--ops-metric-emphasis)',
                            fontFamily: 'var(--font-heading)',
                        }}
                    >
                        {value}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--ops-metric-unit)' }}>{unit}</span>
                </div>

                {/* Subtext explaining threshold */}
                {type !== 'pressure' && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--ops-metric-caption)', marginTop: '0.25rem' }}>
                        {isInverseThreshold ? 'Alert above ' : 'Alert below '}
                        {threshold}
                        {unit}
                    </p>
                )}

                {/* Updated timestamp */}
                {type !== 'pressure' && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--ops-metric-caption)', marginTop: 2 }}>
                        Updated {updatedMinAgo} min ago
                    </div>
                )}

                {/* Slider for Pressure */}
                {type === 'pressure' && (
                    <div style={{ marginTop: '0.75rem' }}>
                        <input
                            type="range"
                            min="0"
                            max={maxValue}
                            value={value}
                            onChange={(e) => onValueChange && onValueChange(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                )}
            </div>

            {/* Progress Bar for non-slider items */}
            {type !== 'pressure' && (
                <div style={{
                    width: '100%', height: 4,
                    background: 'var(--progress-track-bg, rgba(255,255,255,0.1))',
                    borderRadius: 2, marginTop: '0.75rem', overflow: 'hidden',
                    boxShadow: 'var(--progress-track-shadow, none)'
                }}>
                    <div style={{
                        width: `${Math.min((parseFloat(value) / maxValue) * 100, 100)}%`,
                        height: '100%',
                        background: activeColor,
                        transition: 'width 0.5s ease-out',
                        boxShadow: 'var(--progress-bar-glow, none)'
                    }} />
                </div>
            )}
        </div>
    );
};

export default StatusCard;
