import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Crosshair, Zap } from 'lucide-react';
import CameraFeed from '../components/CameraFeed';

const DeployRobot = () => {
    const [isEngaged, setIsEngaged] = useState(false);

    const handleEngage = () => {
        setIsEngaged(!isEngaged);
    };

    return (
        <div className="fade-in" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem 2rem',
            gap: '1.5rem'
        }}>
            {/* Header with Title and Engage Button */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                        <span style={{ color: isEngaged ? 'var(--status-critical)' : 'var(--text-muted)' }}>●</span> Manual Override
                    </h1>
                    <button
                        onClick={handleEngage}
                        className="engage-btn"
                        style={{
                            padding: '0.5rem 1.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'white',
                            background: isEngaged
                                ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                                : 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            transition: 'all 0.3s ease',
                            boxShadow: isEngaged ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none'
                        }}
                    >
                        <Zap size={16} fill={isEngaged ? "currentColor" : "none"} className={isEngaged ? "pulse-icon" : ""} />
                        <span>{isEngaged ? 'ENGAGED' : 'ENGAGE'}</span>
                    </button>
                </div>

                <div style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    LATENCY: 24ms | SIGNAL: STRONG
                </div>
            </header>

            {/* Main Content: Vertical Stack */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                overflow: 'hidden'
            }}>

                {/* Top: Camera Feed */}
                <div style={{
                    flex: 2,
                    position: 'relative',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 0 30px rgba(0,0,0,0.3)',
                    background: '#000'
                }}>
                    <CameraFeed />

                    {/* Overlay HUD Lines */}
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                        margin: '16px',
                        borderRadius: '12px'
                    }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 20, height: 20, border: '1px solid rgba(255,255,255,0.3)' }} />
                        <div style={{ position: 'absolute', top: '50%', left: 0, width: 10, height: 1, background: 'rgba(255,255,255,0.3)' }} />
                        <div style={{ position: 'absolute', top: '50%', right: 0, width: 10, height: 1, background: 'rgba(255,255,255,0.3)' }} />
                    </div>
                </div>

                {/* Bottom: Controls Row */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6rem',
                    paddingBottom: '2rem'
                }}>

                    {/* Analog Stick */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        <div className="panel-box" style={{ padding: '2.5rem', borderRadius: '50%', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)' }}>
                            <div className="analog-stick-base" style={{
                                width: 240, height: 240,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                                border: '2px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 0 30px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.8)',
                                position: 'relative',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {/* Stick */}
                                <div style={{
                                    width: 120, height: 120,
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle at 30% 30%, #444 0%, #111 100%)',
                                    boxShadow: '0 15px 30px rgba(0,0,0,0.8), inset 0 2px 5px rgba(255,255,255,0.2)',
                                    position: 'relative',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{
                                        position: 'absolute', inset: 0, margin: 'auto',
                                        width: 60, height: 60, borderRadius: '50%',
                                        background: 'repeating-radial-gradient(#333 0, #333 2px, transparent 3px, transparent 10px)',
                                        opacity: 0.3
                                    }} />
                                </div>
                            </div>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.2em', fontWeight: 'bold' }}>DRIVE</span>
                    </div>

                    {/* D-Pad */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        <div className="panel-box" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)' }}>
                            <div style={{ position: 'relative', width: 240, height: 240 }}>
                                <button className="dpad-btn" style={{
                                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                                    width: 70, height: 90, borderRadius: '12px',
                                    background: '#222', border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}><ArrowUp size={32} color="var(--text-secondary)" /></button>

                                <button className="dpad-btn" style={{
                                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                                    width: 70, height: 90, borderRadius: '12px',
                                    background: '#222', border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}><ArrowDown size={32} color="var(--text-secondary)" /></button>

                                <button className="dpad-btn" style={{
                                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                                    width: 90, height: 70, borderRadius: '12px',
                                    background: '#222', border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}><ArrowLeft size={32} color="var(--text-secondary)" /></button>

                                <button className="dpad-btn" style={{
                                    position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                                    width: 90, height: 70, borderRadius: '12px',
                                    background: '#222', border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}><ArrowRight size={32} color="var(--text-secondary)" /></button>

                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    width: 60, height: 60, borderRadius: 8, background: '#151515',
                                    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)'
                                }} />
                            </div>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.2em', fontWeight: 'bold' }}>ADJUST</span>
                    </div>

                </div>

            </div>

            <style>{`
                .dpad-btn:active {
                    transform: none !important;
                    background: var(--status-blue) !important;
                    color: white !important;
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
                }
                
                .pulse-icon {
                    animation: iconPulse 1s infinite alternate;
                }
                
                @keyframes iconPulse {
                    from { opacity: 1; transform: scale(1); }
                    to { opacity: 0.7; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

export default DeployRobot;
