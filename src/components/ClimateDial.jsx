import React, { useState } from 'react';
import { Minus, Plus, Fan, Thermometer } from 'lucide-react';

const ClimateDial = () => {
    const [temp, setTemp] = useState(21);
    const min = 16;
    const max = 30;

    // Calculate stroke for SVG circle
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const percent = (temp - min) / (max - min);
    const strokeDashoffset = circumference - percent * circumference;

    // Visual Logic
    const isCooling = temp < 21;
    const color = isCooling ? 'var(--accent-blue)' : 'var(--accent-warm)';

    const adjust = (val) => {
        const newTemp = Math.min(Math.max(temp + val, min), max);
        setTemp(newTemp);
    }

    return (
        <div className="glass-card" style={{
            gridColumn: 'span 2',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            {/* Left Info */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ padding: 8, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                        <Fan size={20} className={isCooling ? 'animate-spin-slow' : ''} color={color} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        LIVING ROOM AC
                    </span>
                </div>

                <h3 style={{ fontSize: '3rem', fontWeight: 300, display: 'flex' }}>
                    {temp}<span style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>°c</span>
                </h3>
                <p style={{ color: color, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {isCooling ? 'Cooling to match' : 'Heating up'}
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button onClick={() => adjust(-1)} style={{
                        width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                        background: 'transparent', transition: 'all 0.2s',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <Minus size={20} />
                    </button>
                    <button onClick={() => adjust(1)} style={{
                        width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                        background: 'transparent', transition: 'all 0.2s',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* Visual Dial */}
            <div style={{ position: 'relative', width: 200, height: 200 }}>
                <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                        fill="transparent"
                        r={radius}
                        cx="100"
                        cy="100"
                    />
                    {/* Indicator */}
                    <circle
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx="100"
                        cy="100"
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: strokeDashoffset,
                            transition: 'stroke-dashoffset 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), stroke 0.5s ease'
                        }}
                    />
                </svg>

                {/* Center Content */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CURRENT</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>24°</div>
                </div>
            </div>
        </div>
    );
};

export default ClimateDial;
