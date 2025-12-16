import React, { useState } from 'react';
import { Activity, CheckCircle, AlertCircle, Play, Loader, Shield, Wifi, Battery, Server, Eye } from 'lucide-react';

const HealthCheck = () => {
    const [systems, setSystems] = useState([
        { id: 1, name: 'Main Engine', icon: Server, status: 'idle' },
        { id: 2, name: 'Smart Sensors', icon: Eye, status: 'idle' },
        { id: 3, name: 'Home Connection', icon: Wifi, status: 'idle' },
        { id: 4, name: 'Battery Health', icon: Battery, status: 'idle' },
    ]);
    const [isGlobalRunning, setIsGlobalRunning] = useState(false);

    const runTest = (id) => {
        setSystems(prev => prev.map(sys => sys.id === id ? { ...sys, status: 'running' } : sys));
        setTimeout(() => {
            setSystems(prev => prev.map(sys =>
                sys.id === id ? { ...sys, status: Math.random() > 0.1 ? 'ok' : 'attention' } : sys
            ));
        }, 1500 + Math.random() * 1000);
    };

    const runAllTests = () => {
        setIsGlobalRunning(true);
        setSystems(prev => prev.map(sys => ({ ...sys, status: 'waiting' })));

        systems.forEach((sys, index) => {
            setTimeout(() => {
                runTest(sys.id);
            }, index * 1000);
        });

        setTimeout(() => {
            setIsGlobalRunning(false);
        }, systems.length * 1000 + 2000);
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'running': return <span className="text-gradient" style={{ animation: 'pulse 1s infinite' }}>Scanning...</span>;
            case 'ok': return <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> Optimal</span>;
            case 'attention': return <span style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={16} /> Check Needed</span>;
            case 'waiting': return <span style={{ color: 'var(--text-tertiary)' }}>Pending...</span>;
            default: return <span style={{ color: 'var(--text-tertiary)' }}>Ready to Scan</span>;
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 0 0 2rem', paddingTop: '1rem' }}>
            <div className="animate-enter" style={{ marginBottom: '3rem' }}>
                <h1 className="text-gradient" style={{
                    fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '300',
                    display: 'flex', alignItems: 'center', gap: '1rem'
                }}>
                    <Shield size={32} color="var(--accent-blue)" />
                    System Health Check
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Ensure your home protection systems are running perfectly.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Global Action Card */}
                <div className="glass-panel animate-enter" style={{
                    padding: '2rem', borderRadius: 'var(--radius-lg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '1rem'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.5rem' }}>Full System Scan</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Run a complete diagnostic of all 4 sub-systems.</p>
                    </div>
                    <button
                        onClick={runAllTests}
                        disabled={isGlobalRunning}
                        style={{
                            background: isGlobalRunning ? 'rgba(255,255,255,0.05)' : 'var(--text-primary)',
                            color: isGlobalRunning ? 'white' : 'black',
                            padding: '1rem 2rem', borderRadius: 'var(--radius-md)',
                            fontWeight: '600', fontSize: '1rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            opacity: isGlobalRunning ? 0.7 : 1,
                            boxShadow: isGlobalRunning ? 'none' : '0 0 20px rgba(255,255,255,0.3)'
                        }}
                    >
                        {isGlobalRunning ? <Loader className="spin" size={20} /> : <Play size={20} fill="black" />}
                        {isGlobalRunning ? 'Scanning Home...' : 'Start Scan'}
                    </button>
                </div>

                {/* Individual Systems */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    {systems.map((sys, i) => (
                        <div key={sys.id} className={`glass-panel animate-enter delay-${(i + 1) * 100}`} style={{
                            padding: '1.5rem', borderRadius: 'var(--radius-md)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{
                                    padding: '12px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)'
                                }}>
                                    <sys.icon size={24} color="var(--accent-blue)" />
                                </div>
                                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{sys.name}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                                <div style={{ minWidth: '120px', textAlign: 'right' }}>
                                    {getStatusDisplay(sys.status)}
                                </div>
                                {sys.status === 'idle' && !isGlobalRunning && (
                                    <button
                                        onClick={() => runTest(sys.id)}
                                        style={{
                                            color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: '500',
                                            opacity: 0.8
                                        }}
                                    >
                                        Test
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HealthCheck;
