import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const HouseMap = () => {
    // Hardcoded rooms layout
    const rooms = [
        { id: 'living', name: 'Living Room', x: 10, y: 10, w: 50, h: 60, color: 'rgba(96, 165, 250, 0.1)' },
        { id: 'kitchen', name: 'Kitchen', x: 65, y: 10, w: 30, h: 35, color: 'rgba(212, 175, 55, 0.1)' },
        { id: 'hall', name: 'Hallway', x: 65, y: 50, w: 15, h: 40, color: 'rgba(255, 255, 255, 0.05)' },
        { id: 'bed', name: 'Bedroom', x: 10, y: 75, w: 40, h: 20, color: 'rgba(16, 185, 129, 0.1)' },
    ];

    const robotPos = { x: 35, y: 40, rot: 45 }; // Relative to map container %

    return (
        <div className="glass-panel" style={{
            width: '100%',
            height: '400px',
            position: 'relative',
            overflow: 'hidden',
            padding: '1.5rem'
        }}>
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>House Map</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <MapPin size={14} color="var(--status-blue)" />
                    Robot in: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Living Room</span>
                </div>
            </div>

            {/* Map Container */}
            <div style={{
                width: '100%', height: '100%',
                position: 'relative',
                marginTop: '1rem'
            }}>
                {/* Grid Lines Background */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.5
                }} />

                {/* Rooms */}
                {rooms.map(room => (
                    <div key={room.id} style={{
                        position: 'absolute',
                        left: `${room.x}%`, top: `${room.y}%`,
                        width: `${room.w}%`, height: `${room.h}%`,
                        background: room.color,
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.3)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        {room.name}
                    </div>
                ))}

                {/* Robot Marker */}
                <div style={{
                    position: 'absolute',
                    left: `${robotPos.x}%`, top: `${robotPos.y}%`,
                    width: 32, height: 32,
                    marginLeft: -16, marginTop: -16, // Center anchor
                    zIndex: 20
                }}>
                    {/* Pulse */}
                    <div style={{
                        position: 'absolute', inset: -8,
                        border: '1px solid var(--status-blue)',
                        borderRadius: '50%',
                        opacity: 0,
                        animation: 'radarPulse 2s infinite'
                    }} />

                    {/* Icon */}
                    <div style={{
                        width: '100%', height: '100%',
                        background: 'var(--status-blue)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transform: `rotate(${robotPos.rot}deg)`,
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
                    }}>
                        <Navigation size={18} color="white" fill="white" />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes radarPulse {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default HouseMap;
