import React from 'react';

const DeviceCard = ({ icon: Icon, label, subLabel, isOn, onToggle, activeColor = 'var(--accent-gold)' }) => {
    return (
        <div
            className="glass-card"
            onClick={onToggle}
            style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                aspectRatio: '1/1',
                cursor: 'pointer',
                background: isOn ? 'rgba(255,255,255,0.1)' : 'var(--glass-base)',
                borderColor: isOn ? 'rgba(255,255,255,0.2)' : 'var(--glass-border)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: isOn ? activeColor : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isOn ? '#000' : 'white',
                    transition: 'all 0.4s ease',
                    boxShadow: isOn ? `0 0 20px ${activeColor}` : 'none'
                }}>
                    <Icon size={20} fill={isOn ? "currentColor" : "none"} />
                </div>

                <div style={{
                    width: 32, height: 18, borderRadius: 99,
                    background: isOn ? activeColor : 'rgba(255,255,255,0.1)',
                    position: 'relative',
                    transition: 'background 0.3s'
                }}>
                    <div style={{
                        width: 14, height: 14, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 2, left: isOn ? 16 : 2,
                        transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                </div>
            </div>

            <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {label}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {subLabel || (isOn ? 'On' : 'Off')}
                </p>
            </div>
        </div>
    );
};

export default DeviceCard;
