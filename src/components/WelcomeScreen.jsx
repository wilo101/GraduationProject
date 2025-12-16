import React from 'react';
import { Sun } from 'lucide-react';

const WelcomeScreen = ({ onStart }) => {
    return (
        <div className="animate-enter glass-panel" style={{
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem'
        }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--accent-amber)' }}>
                    <Sun size={20} />
                    <span style={{ fontWeight: '500' }}>Good Morning</span>
                </div>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '300', marginBottom: '0.5rem' }}>
                    Welcome Home
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    System is <strong style={{ color: 'var(--accent-success)' }}>Active & Ready</strong>. All sensors are nominal.
                </p>
            </div>

            <button
                onClick={onStart}
                className="glass-panel"
                style={{
                    padding: '1rem 2rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    fontSize: '1.1rem',
                    background: 'rgba(255,255,255,0.05)'
                }}
            >
                Wake System
            </button>
        </div>
    );
};

export default WelcomeScreen;
