import React from 'react';
import { Cloud, MoveUpRight, Music, Play, SkipForward } from 'lucide-react';

export const GreetingWidget = ({ name = "Alex" }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div style={{ padding: '0 0 2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className="fade-in">
                <h1
                    dir="auto"
                    className="mixed-bidi"
                    style={{
                        fontSize: '3rem', fontWeight: 600,
                        background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        letterSpacing: '-1px'
                    }}
                >
                    {greeting}, <bdi>{name}</bdi>
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Facility profile: <strong>Night operations</strong>. Perimeter and patrol nominal.
                </p>
            </div>

            {/* Weather Pill */}
            <div className="glass-card" style={{
                padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: 99
            }}>
                <Cloud size={24} color="var(--accent-blue)" fill="rgba(96, 165, 250, 0.2)" />
                <div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ops-metric-emphasis)' }}>18°</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--ops-metric-caption)', marginInlineStart: '0.5rem' }}>Cloudy</span>
                </div>
            </div>
        </div>
    );
};

export const MusicWidget = () => {
    return (
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Album Art */}
            <div style={{
                width: 80, height: 80, borderRadius: '12px', overflow: 'hidden', position: 'relative',
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
            }}>
                <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(45deg, #FF6B6B, #556270)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Music color="white" size={32} />
                </div>
            </div>

            <div style={{ flex: 1 }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.75rem', color: 'var(--accent-gold)', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em'
                }}>
                    <div className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                    FIELD COMMS CHANNEL
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Midnight City</h4>
                <p style={{ color: 'var(--text-secondary)' }}>M83 • Hurry Up, We're Dreaming</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button style={{
                    width: 48, height: 48, borderRadius: '50%', background: 'white', color: 'black',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                }}>
                    <Play size={24} fill="black" style={{ marginInlineStart: 4 }} />
                </button>
            </div>
        </div>
    );
};
