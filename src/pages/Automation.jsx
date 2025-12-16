import React from 'react';
import { Calendar, Map, CheckCircle } from 'lucide-react';

const Automation = () => {
    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Automation & Scheduling</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '50%' }}>
                            <Calendar size={24} color="var(--text-primary)" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem' }}>Daily Patrol</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Robot patrols all rooms every day at 09:00 AM and 09:00 PM.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-success)', borderRadius: '1rem', fontSize: '0.875rem' }}>Active</span>
                        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '1rem', fontSize: '0.875rem' }}>Next: 9:00 PM</span>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '50%' }}>
                            <Map size={24} color="var(--text-primary)" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem' }}>Map Update</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Full floor plan scan and obstacle mapping.
                    </p>
                    <button style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '500'
                    }}>
                        Schedule Scan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Automation;
