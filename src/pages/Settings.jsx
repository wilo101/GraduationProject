import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Activity, Cpu, Wifi, Battery, Eye, Navigation } from 'lucide-react';

const Settings = () => {
    const [scanProgress, setScanProgress] = useState(0);
    const [activeItem, setActiveItem] = useState(0);

    const systems = [
        { id: 1, name: 'Core Processor', icon: Cpu },
        { id: 2, name: 'Sensor Array', icon: Activity },
        { id: 3, name: 'Motor Systems', icon: Navigation },
        { id: 4, name: 'Optical Cameras', icon: Eye },
        { id: 5, name: 'Wireless Uplink', icon: Wifi },
        { id: 6, name: 'Power Cells', icon: Battery },
    ];

    useEffect(() => {
        // Simulate scanning process
        let interval;
        if (activeItem < systems.length) {
            interval = setInterval(() => {
                setActiveItem(prev => prev + 1);
            }, 800);
        } else {
            setScanProgress(100);
        }
        return () => clearInterval(interval);
    }, [activeItem]);

    return (
        <div className="fade-in" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>System Diagnostics</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                Performing automated hardware and software integrity check.
            </p>

            <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', width: '100%', maxWidth: '900px', justifyContent: 'center' }}>

                {/* Visual Scanner */}
                <div style={{ position: 'relative', width: 300, height: 300, flexShrink: 0 }}>
                    {/* Rings */}
                    <div className="scan-ring" style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                    <div className="scan-ring-inner" style={{ position: 'absolute', inset: 30, border: '2px solid rgba(255,255,255,0.05)', borderRadius: '50%', borderStyle: 'dashed' }} />
                    <div className="scan-ring-core" style={{ position: 'absolute', inset: 80, background: 'rgba(255,255,255,0.02)', borderRadius: '50%', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} />

                    {/* Scanning Line */}
                    <div className="scanner-line" style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.2) 60deg, transparent 60deg)',
                        animation: 'spin 2s linear infinite',
                        opacity: activeItem < systems.length ? 1 : 0
                    }} />

                    {/* Center Status */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                            {Math.min(Math.round((activeItem / systems.length) * 100), 100)}%
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {activeItem < systems.length ? 'SCANNING' : 'COMPLETE'}
                        </div>
                    </div>
                </div>

                {/* Systems List */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {systems.map((sys, index) => {
                        const isComplete = index < activeItem;
                        const isScanning = index === activeItem;

                        return (
                            <div key={sys.id} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '1rem 1.5rem',
                                background: isScanning ? 'rgba(255,255,255,0.05)' : 'transparent',
                                border: '1px solid',
                                borderColor: isScanning ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                transform: isScanning ? 'translateX(10px)' : 'translateX(0)'
                            }}>
                                <div style={{
                                    padding: '0.5rem', borderRadius: '8px',
                                    background: isComplete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                    color: isComplete ? '#10b981' : 'var(--text-secondary)'
                                }}>
                                    <sys.icon size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, color: isComplete || isScanning ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                        {sys.name}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {isComplete ? 'Operational' : isScanning ? 'Analyzing...' : 'Pending'}
                                    </div>
                                </div>
                                {isComplete && <CheckCircle size={20} color="#10b981" />}
                                {isScanning && <div className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'white', borderRadius: '50%' }} />}
                            </div>
                        );
                    })}
                </div>

            </div>

            <style>{`
@keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
}
                .spinner { animation: spin 1s linear infinite; }
`}</style>

        </div>
    );
};

export default Settings;
