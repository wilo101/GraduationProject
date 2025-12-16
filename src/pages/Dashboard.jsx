import React, { useState } from 'react';
import CameraFeed from '../components/CameraFeed';
import StatusCard from '../components/StatusCard';
import HouseMap from '../components/HouseMap';
import { Ban, Scan, OctagonX } from 'lucide-react';

const Dashboard = () => {
    // State for cards
    const [pressure, setPressure] = useState(65);
    const [isStopped, setIsStopped] = useState(false);

    // Greeting time logic
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="fade-in" style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem 1rem 2rem 5rem' // Extra left padding for sidebar space
        }}>

            {/* Header with Actions */}
            <header style={{
                marginBottom: '2.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
            }}>
                <div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                        {greeting}, Wilo!
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                        Ready to control your smart home?
                    </p>
                </div>

                {/* Header Actions */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <Scan size={18} />
                        View & Pair Devices
                    </button>

                    <button
                        onClick={() => setIsStopped(!isStopped)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: isStopped ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                            border: isStopped ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 'var(--radius-md)',
                            color: isStopped ? '#ef4444' : 'var(--text-primary)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)',
                            boxShadow: isStopped ? '0 0 15px rgba(239, 68, 68, 0.1)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isStopped ? 'scale(0.95)' : 'scale(1)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isStopped) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            } else {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isStopped) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            } else {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            }
                        }}
                    >
                        <OctagonX size={18} />
                        {isStopped ? 'ROBOT STOPPED' : 'STOP ROBOT'}
                    </button>
                </div>
            </header>

            {/* Top Grid: Camera & Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '1.5rem',
                marginBottom: '1.5rem'
            }}>

                {/* Camera Feed - Takes up 7 columns */}
                <div style={{ gridColumn: 'span 7', minHeight: '340px' }}>
                    <CameraFeed />
                </div>

                {/* Status Cards - Takes up 5 columns, 2x2 grid */}
                <div style={{
                    gridColumn: 'span 5',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem'
                }}>
                    <StatusCard
                        type="temp"
                        label="Temperature"
                        value="24"
                        unit="°C"
                        threshold={18} // Alert if under 18
                        maxValue={40}
                    />
                    <StatusCard
                        type="battery"
                        label="Battery"
                        value="82"
                        unit="%"
                        threshold={20} // Alert if under 20%
                        maxValue={100}
                    />
                    <StatusCard
                        type="water"
                        label="Water Tank"
                        value="45"
                        unit="%"
                        threshold={15}
                        maxValue={100}
                    />
                    <StatusCard
                        type="pressure"
                        label="Water Pressure"
                        value={pressure}
                        unit=" PSI"
                        maxValue={100}
                        onValueChange={setPressure}
                        threshold={0} // Manual control mainly
                    />
                </div>
            </div>

            {/* Bottom Section: Map */}
            <div style={{ width: '100%' }}>
                <HouseMap />
            </div>

        </div>
    );
};

export default Dashboard;
