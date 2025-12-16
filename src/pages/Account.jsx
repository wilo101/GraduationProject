import React from 'react';
import { User, Map as MapIcon, Mail, Lock, Bell, Globe, ChevronRight, LogOut } from 'lucide-react';

const AccountSection = ({ title, children }) => (
    <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{
            fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem',
            color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em'
        }}>
            {title}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {children}
        </div>
    </div>
);

const AccountRow = ({ icon: Icon, label, value, action, isDestructive }) => (
    <div className="glass-card" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem', backdropFilter: 'blur(10px)',
        cursor: 'pointer', transition: 'all 0.2s',
        border: isDestructive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)'
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = isDestructive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.08)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                padding: '0.5rem', borderRadius: '8px',
                background: isDestructive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isDestructive ? '#ef4444' : 'white'
            }}>
                <Icon size={20} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 500, color: isDestructive ? '#ef4444' : 'var(--text-primary)' }}>
                {label}
            </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            {value && <span style={{ fontSize: '0.9rem' }}>{value}</span>}
            {action || <ChevronRight size={18} />}
        </div>
    </div>
);

const MapCard = ({ name, date }) => (
    <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s'
    }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div style={{ height: 100, background: 'linear-gradient(45deg, #111, #222)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapIcon size={32} color="rgba(255,255,255,0.2)" />
        </div>
        <div style={{ padding: '0.75rem' }}>
            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{date}</div>
        </div>
    </div>
);

const Account = () => {
    return (
        <div className="fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>

            {/* Header / Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', fontWeight: 700, color: 'white',
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                }}>
                    W
                </div>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Wilo</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Premium Member • Online</p>
                </div>
            </div>

            {/* Saved Maps */}
            <AccountSection title="Saved Maps">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                    <MapCard name="Home - Level 1" date="Updated 2h ago" />
                    <MapCard name="Office" date="Updated 1d ago" />
                    <MapCard name="Garage" date="Updated 1w ago" />
                    <div style={{
                        border: '1px dashed var(--glass-border)', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100,
                        color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer'
                    }}>
                        + New Map
                    </div>
                </div>
            </AccountSection>

            {/* Account Info */}
            <AccountSection title="Security & Login">
                <AccountRow icon={Mail} label="Change Email" value="wilo@example.com" />
                <AccountRow icon={Lock} label="Change Password" value="••••••••" />
            </AccountSection>

            {/* Preferences */}
            <AccountSection title="Preferences">
                <AccountRow
                    icon={Bell}
                    label="Notifications"
                    action={
                        <div style={{ width: 44, height: 24, background: '#3b82f6', borderRadius: 99, position: 'relative' }}>
                            <div style={{ position: 'absolute', right: 2, top: 2, width: 20, height: 20, background: 'white', borderRadius: '50%' }} />
                        </div>
                    }
                />
                <AccountRow icon={Globe} label="Country / Region" value="Egypt" />
            </AccountSection>

            {/* Danger Zone */}
            <div style={{ marginTop: '3rem' }}>
                <AccountRow icon={LogOut} label="Log Out" isDestructive />
            </div>

        </div>
    );
};

export default Account;
