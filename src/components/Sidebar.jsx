import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Settings, Map, Rocket, User } from 'lucide-react';
import logo from '../assets/afr-logo.png';

const Sidebar = () => {
    // Icons matching the reference style
    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Map, label: 'Map', path: '/map-view' },
        { icon: Rocket, label: 'Deploy', path: '/deploy' },
        { icon: User, label: 'Account', path: '/account' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside style={{
            position: 'fixed',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start', // Align to left so expansion goes right
            gap: '0.75rem',
            padding: '1rem 0.75rem',
            background: 'var(--glass-base)',
            backdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-xl)', // Slightly less rounded to accommodate lists? No, keep it rounded.
            boxShadow: 'var(--shadow-soft)',
            transition: 'width 0.3s ease'
        }}>

            {/* Top Indicator / Logo */}
            <div style={{
                width: 40, height: 40,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.5rem',
                alignSelf: 'center',
                overflow: 'hidden'
            }}>
                <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            opacity: isActive ? 1 : 0.7,
                            padding: '0.6rem',
                            borderRadius: '99px',
                            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                            overflow: 'hidden',
                            width: 'fit-content' // Allow expansion
                        })}
                    >
                        <div style={{ minWidth: 24, display: 'flex', justifyContent: 'center' }}>
                            <item.icon size={24} strokeWidth={1.5} />
                        </div>

                        {/* Label - Expands on hover via CSS in style tag or inline hover detection if needed, but CSS is cleaner. 
                            However, since we are using inline styles for logic, let's add a class and simple toggle or just use a group hover approach.
                            Actually, simpler to just use a small separate style block or inline hover state using JS if we want to be pure in one file without external CSS. 
                            Let's use the 'group' concept by detecting hover on the link itself in js? No, let's use a module-like approach with inner style.
                        */}
                        <span className="nav-label" style={{
                            marginLeft: '0.75rem',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            opacity: 0,
                            maxWidth: 0,
                            transition: 'all 0.3s ease',
                            display: 'inline-block'
                        }}>
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Decoration */}
            <div style={{ marginTop: '1rem', width: 20, height: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />

            <style>{`
                .nav-item:hover {
                    background: rgba(255,255,255,0.15) !important;
                    opacity: 1 !important;
                    padding-right: 1.2rem !important;
                }
                .nav-item:hover .nav-label {
                    opacity: 1 !important;
                    max-width: 100px !important;
                }
            `}</style>

        </aside>
    );
};

export default Sidebar;
