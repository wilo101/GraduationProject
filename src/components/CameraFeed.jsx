import React from 'react';
import { Maximize2, Video, Activity, Mic } from 'lucide-react';

const CameraFeed = () => {
    return (
        <div className="glass-panel" style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '320px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000'
        }}>
            {/* Simulated Video Feed Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(45deg, #1a1a1a 0%, #2a2a2a 100%)',
                opacity: 0.8
            }}>
                {/* Placeholder grid for video feel */}
                <div style={{
                    width: '100%', height: '100%',
                    backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    opacity: 0.3
                }} />
            </div>

            {/* Placeholder content if no video */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', opacity: 0.5 }}>
                <Video size={48} style={{ marginBottom: '1rem' }} />
                <p style={{ fontFamily: 'var(--font-heading)' }}>Live Feed Offline</p>
            </div>

            {/* Overlays */}
            <div style={{
                position: 'absolute',
                top: '1.5rem',
                left: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                zIndex: 20
            }}>
                <div style={{
                    padding: '0.4rem 0.8rem',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: 'var(--radius-pill)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                    LIVE
                </div>
                <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    backdropFilter: 'blur(4px)'
                }}>
                    Living Room Cam 01
                </div>
            </div>

            {/* Controls Overlay */}
            <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                right: '1.5rem',
                display: 'flex',
                gap: '1rem',
                zIndex: 20
            }}>
                <button style={{
                    width: 40, height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white',
                    backdropFilter: 'blur(4px)'
                }}>
                    <Mic size={18} />
                </button>
                <button style={{
                    width: 40, height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white',
                    backdropFilter: 'blur(4px)'
                }}>
                    <Maximize2 size={18} />
                </button>
            </div>

            {/* Decorative Corners */}
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: 20, height: 20, borderTop: '2px solid rgba(255,255,255,0.2)', borderRight: '2px solid rgba(255,255,255,0.2)', borderTopRightRadius: 8 }} />
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', width: 20, height: 20, borderBottom: '2px solid rgba(255,255,255,0.2)', borderLeft: '2px solid rgba(255,255,255,0.2)', borderBottomLeftRadius: 8 }} />

        </div>
    );
};

export default CameraFeed;
