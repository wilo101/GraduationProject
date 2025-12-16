import React from 'react';
import { MapPin, Compass, Crosshair, Navigation } from 'lucide-react';

const MapPanel = () => {
    return (
        <div className="premium-card animate-enter animate-enter-delay-3" style={{
            padding: '1.5rem',
            marginTop: '1.5rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '350px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        padding: '8px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                        color: 'var(--accent-primary)'
                    }}>
                        <Compass size={20} />
                    </div>
                    <div>
                        <h3 style={{
                            fontFamily: 'var(--font-ui)', fontSize: '0.9rem', fontWeight: 600,
                            letterSpacing: '0.05em', color: 'var(--text-primary)'
                        }}>
                            TACTICAL MAP
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-online)' }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                                GPS LOCK: 34.0522°N, 118.2437°W
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem', fontWeight: 500,
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}>
                        REROUTE
                    </button>
                    <button style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem', fontWeight: 500,
                        background: 'rgba(255,255,255,0.05)',
                        cursor: 'pointer'
                    }}>
                        EXPAND
                    </button>
                </div>
            </div>

            {/* Map Area */}
            <div style={{
                flex: 1,
                background: '#0e1012',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* Grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                    opacity: 0.5
                }} />

                {/* Radar Sweep */}
                <div style={{
                    position: 'absolute', width: '200%', height: '200%', left: '-50%', top: '-50%',
                    background: 'conic-gradient(from 0deg at 50% 50%, rgba(59, 130, 246, 0.05) 0deg, transparent 60deg, transparent 360deg)',
                    animation: 'spin 8s linear infinite',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

                {/* Elements */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{
                        width: 20, height: 20, background: 'var(--accent-primary)',
                        borderRadius: '50%', boxShadow: '0 0 20px var(--accent-primary)',
                        border: '2px solid white'
                    }} />
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: 200, height: 200, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '50%'
                    }} />
                </div>

                <MapPin size={24} color="#f59e0b" fill="#f59e0b" style={{ position: 'absolute', top: '30%', left: '60%', filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))' }} />
                <Navigation size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', bottom: '20%', left: '20%', transform: 'rotate(45deg)' }} />

            </div>
        </div>
    );
};

export default MapPanel;
