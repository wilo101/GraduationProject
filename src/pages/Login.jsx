import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock login
        navigate('/');
    };

    return (
        <div className="fade-in" style={{
            height: '100vh',
            width: '100vw',
            background: 'var(--bg-deep)',
            backgroundImage: 'var(--bg-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>

            {/* Background Decor */}
            <div style={{ position: 'absolute', top: -100, left: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -100, right: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

            <div className="glass-card" style={{
                width: '100%', maxWidth: '420px',
                padding: '3rem 2.5rem',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue to your dashboard</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Email Input */}
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, marginLeft: '0.25rem' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.8rem 1rem 0.8rem 3rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--glass-border)', borderRadius: '12px',
                                    color: 'white', fontSize: '1rem', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500, marginLeft: '0.25rem' }}>Password</label>
                            <span style={{ fontSize: '0.85rem', color: '#3b82f6', cursor: 'pointer' }}>Forgot Password?</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.8rem 1rem 0.8rem 3rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--glass-border)', borderRadius: '12px',
                                    color: 'white', fontSize: '1rem', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>
                    </div>

                    <button type="submit" style={{
                        marginTop: '0.5rem',
                        padding: '1rem', borderRadius: '12px',
                        background: 'linear-gradient(135deg, white 0%, #e0e0e0 100%)',
                        color: 'black', fontSize: '1rem', fontWeight: 600,
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        transition: 'transform 0.1s'
                    }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Sign In <ArrowRight size={20} />
                    </button>
                </form>

                <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ height: 1, flex: 1, background: 'var(--glass-border)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OR CONTINUE WITH</span>
                    <div style={{ height: 1, flex: 1, background: 'var(--glass-border)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button className="social-btn" style={{
                        padding: '0.8rem', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                        color: 'white', fontSize: '0.9rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        transition: 'background 0.2s'
                    }}>
                        {/* Google Logo SVG */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button className="social-btn" style={{
                        padding: '0.8rem', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                        color: 'white', fontSize: '0.9rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        transition: 'background 0.2s'
                    }}>
                        {/* Apple Logo SVG */}
                        <svg width="20" height="20" viewBox="0 0 384 512" fill="white">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                        </svg>
                        Apple
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
                    <span style={{ color: 'white', fontWeight: 600, cursor: 'pointer' }}>Create Account</span>
                </div>

            </div>

            <style>{`
                .social-btn:hover { background: rgba(255,255,255,0.1) !important; }
            `}</style>
        </div>
    );
};

export default Login;
