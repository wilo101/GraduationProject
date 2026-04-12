import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { User, Map as MapIcon, Mail, Lock, Bell, Globe, ChevronRight, LogOut, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import CountrySelect from '../components/CountrySelect';

const AccountSection = ({ title, children }) => (
    <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{
            fontFamily: 'var(--font-heading)',
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

const AccountRow = ({ icon: Icon, label, value, action, isDestructive, onClick }) => (
    <div
        className="glass-card"
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={onClick ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
            }
        } : undefined}
        style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.25rem', backdropFilter: 'blur(10px)',
            cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s',
            background: 'var(--account-row-bg)',
            border: isDestructive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)',
            borderBottom: isDestructive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-default)'
        }}
        onMouseEnter={(e) => {
            if (!onClick) return;
            e.currentTarget.style.background = isDestructive ? 'rgba(239, 68, 68, 0.1)' : 'var(--account-row-hover)';
        }}
        onMouseLeave={(e) => {
            if (!onClick) return;
            e.currentTarget.style.background = 'var(--account-row-bg)';
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                padding: '0.5rem', borderRadius: '8px',
                background: isDestructive ? 'rgba(239, 68, 68, 0.2)' : 'var(--account-icon-tile-bg)',
                color: isDestructive ? '#ef4444' : 'var(--account-icon-tile-fg)'
            }}>
                <Icon size={20} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 500, color: isDestructive ? '#ef4444' : 'var(--text-primary)' }}>
                {label}
            </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            {value && <span style={{ fontSize: '0.9rem' }}>{value}</span>}
            {action ?? (onClick ? <ChevronRight size={18} /> : null)}
        </div>
    </div>
);

const MapCard = ({ name, date }) => (
    <div style={{
        background: 'var(--account-map-card-bg)',
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

export function AccountSettingsPanel({ embedded = false }) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const reduceMotion = useReducedMotion();
    const panelTransition = reduceMotion
        ? { duration: 0 }
        : { duration: 0.32, ease: [0.25, 0.1, 0.25, 1] };
    /* Height + opacity: avoids layout “snap” when panel unmounts (Preferences jumping up) */
    const panelMotion = reduceMotion
        ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
        : {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: 'auto' },
              exit: { opacity: 0, height: 0 },
          };
    const displayName = user?.name || 'Operator';
    const displayEmail = user?.email || 'wilo@example.com';
    const initial = (displayName || 'W').trim().charAt(0).toUpperCase() || 'W';

    const [editing, setEditing] = useState(null); // 'profile' | 'email' | 'password' | null
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');

    const meta = useMemo(() => user?.raw?.user_metadata || {}, [user]);

    const [fullName, setFullName] = useState(displayName);
    const [country, setCountry] = useState(meta.country || 'Egypt');
    const [notifications, setNotifications] = useState(Boolean(meta.notifications ?? true));

    const [newEmail, setNewEmail] = useState(displayEmail);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [robotActive, setRobotActive] = useState(localStorage.getItem('robot:isActive') === 'true')

    const clearMessages = () => {
        setNotice('');
        setError('');
    };

    const handleLogOut = async () => {
        clearMessages();
        try {
            await logout();
        } finally {
            navigate('/login');
        }
    };

    useEffect(() => {
        const onRobotActive = (e) => {
            const active = Boolean(e?.detail?.active)
            setRobotActive(active)
        }
        const onStorage = (e) => {
            if (e.key === 'robot:isActive') setRobotActive(e.newValue === 'true')
        }
        window.addEventListener('robot:active', onRobotActive)
        window.addEventListener('storage', onStorage)
        return () => {
            window.removeEventListener('robot:active', onRobotActive)
            window.removeEventListener('storage', onStorage)
        }
    }, [])

    const requireSupabase = () => {
        if (!supabase) {
            setError('Supabase is not configured. Check your .env file.');
            return false;
        }
        return true;
    };

    const handleSaveProfile = async () => {
        clearMessages();
        if (!requireSupabase()) return;
        if (fullName.trim().length < 2) {
            setError('Name is too short.');
            return;
        }
        setSaving(true);
        try {
            const { error: e } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName.trim(),
                    name: fullName.trim(),
                    country: country.trim(),
                    notifications: Boolean(notifications),
                },
            });
            if (e) throw e;
            setNotice('Profile updated.');
            setEditing(null);
        } catch (e) {
            setError(e?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEmail = async () => {
        clearMessages();
        if (!requireSupabase()) return;
        if (!newEmail.trim() || !newEmail.includes('@')) {
            setError('Enter a valid email.');
            return;
        }
        setSaving(true);
        try {
            const { error: e } = await supabase.auth.updateUser({ email: newEmail.trim() });
            if (e) throw e;
            setNotice('Email update requested. Check your inbox to confirm (if email confirmations are enabled).');
            setEditing(null);
        } catch (e) {
            setError(e?.message || 'Failed to update email.');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePassword = async () => {
        clearMessages();
        if (!requireSupabase()) return;
        if (!newPassword || newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setSaving(true);
        try {
            const { error: e } = await supabase.auth.updateUser({ password: newPassword });
            if (e) throw e;
            setNotice('Password updated.');
            setNewPassword('');
            setConfirmPassword('');
            setEditing(null);
        } catch (e) {
            setError(e?.message || 'Failed to update password.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="account-settings-panel">
            {!embedded ? (
                <>
                    {/* Header / Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                        {user?.picture ? (
                            <img
                                src={user.picture}
                                alt=""
                                width={80}
                                height={80}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '30%',
                                    objectFit: 'cover',
                                    boxShadow: '0 10px 30px rgba(8, 10, 18, 0.45)',
                                    border: '1px solid var(--glass-border)',
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '30%',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    color: 'white',
                                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                                }}
                            >
                                {initial}
                            </div>
                        )}
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{displayName}</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>{user?.email ? 'Signed in • Online' : 'Premium Member • Online'}</p>
                        </div>
                    </div>

                    {/* Saved Maps */}
                    <AccountSection title="Saved Maps">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                            <MapCard name="Site grid — Sector A" date="Updated 2h ago" />
                            <MapCard name="Office" date="Updated 1d ago" />
                            <MapCard name="Garage" date="Updated 1w ago" />
                            <div
                                style={{
                                    border: '1px dashed var(--glass-border)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 100,
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                }}
                            >
                                + New Map
                            </div>
                        </div>
                    </AccountSection>
                </>
            ) : null}

            {/* Account Info — LayoutGroup smooths vertical shift when collapsible panels close */}
            <LayoutGroup>
            <AccountSection title="Security & Login">
                <AccountRow
                    icon={Mail}
                    label="Change Email"
                    value={displayEmail}
                    action={editing === 'email' ? <X size={18} aria-hidden /> : undefined}
                    onClick={() => {
                        clearMessages();
                        setNewEmail(displayEmail);
                        setEditing(editing === 'email' ? null : 'email');
                    }}
                />
                <AnimatePresence initial={false}>
                    {editing === 'email' ? (
                        <motion.div
                            key="panel-email"
                            initial={panelMotion.initial}
                            animate={panelMotion.animate}
                            exit={panelMotion.exit}
                            transition={panelTransition}
                            style={{ overflow: 'hidden', minHeight: 0 }}
                        >
                            <div className="glass-card account-edit-panel">
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        New email
                                        <input
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="auth-input auth-input--plain"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                        />
                                    </label>
                                    <div className="account-inline-btns">
                                        <button
                                            type="button"
                                            className="account-form-btn account-form-btn--primary"
                                            disabled={saving}
                                            onClick={handleSaveEmail}
                                        >
                                            <Check size={18} aria-hidden /> {saving ? 'Saving…' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            className="account-form-btn account-form-btn--secondary"
                                            onClick={() => setEditing(null)}
                                        >
                                            <X size={18} aria-hidden /> Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <AccountRow
                    icon={Lock}
                    label="Change Password"
                    value="••••••••"
                    action={editing === 'password' ? <X size={18} aria-hidden /> : undefined}
                    onClick={() => {
                        clearMessages();
                        setEditing(editing === 'password' ? null : 'password');
                    }}
                />
                <AnimatePresence initial={false}>
                    {editing === 'password' ? (
                        <motion.div
                            key="panel-password"
                            initial={panelMotion.initial}
                            animate={panelMotion.animate}
                            exit={panelMotion.exit}
                            transition={panelTransition}
                            style={{ overflow: 'hidden', minHeight: 0 }}
                        >
                            <div className="glass-card account-edit-panel">
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        New password
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="auth-input auth-input--plain"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                        />
                                    </label>
                                    <label style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        Confirm password
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="auth-input auth-input--plain"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                        />
                                    </label>
                                    <div className="account-inline-btns">
                                        <button
                                            type="button"
                                            className="account-form-btn account-form-btn--primary"
                                            disabled={saving}
                                            onClick={handleSavePassword}
                                        >
                                            <Check size={18} aria-hidden /> {saving ? 'Saving…' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            className="account-form-btn account-form-btn--secondary"
                                            onClick={() => {
                                                setNewPassword('');
                                                setConfirmPassword('');
                                                setEditing(null);
                                            }}
                                        >
                                            <X size={18} aria-hidden /> Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </AccountSection>

            <motion.div
                layout="position"
                transition={
                    reduceMotion
                        ? { duration: 0 }
                        : { layout: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }
                }
            >
            <AccountSection title="Preferences">
                <AccountRow
                    icon={Bell}
                    label="Notifications"
                    action={
                        <div
                            aria-hidden
                            style={{
                                width: 44,
                                height: 24,
                                background: notifications ? '#3b82f6' : 'rgba(255,255,255,0.18)',
                                borderRadius: 99,
                                position: 'relative',
                                border: '1px solid rgba(255,255,255,0.12)',
                                transition: 'background 0.2s var(--ease-lux)',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    right: notifications ? 2 : 22,
                                    top: 2,
                                    width: 20,
                                    height: 20,
                                    background: 'white',
                                    borderRadius: '50%',
                                    transition: 'right 0.2s var(--ease-lux)',
                                }}
                            />
                        </div>
                    }
                    onClick={() => {
                        clearMessages();
                        setNotifications((v) => !v);
                    }}
                />
                <AnimatePresence initial={false}>
                    {notifications ? (
                        <motion.div
                            key="notify-hint"
                            initial={panelMotion.initial}
                            animate={panelMotion.animate}
                            exit={panelMotion.exit}
                            transition={panelTransition}
                            style={{ overflow: 'hidden', minHeight: 0 }}
                        >
                            <p className="account-notify-hint">
                                Critical and status alerts will surface in the operations center when enabled.
                            </p>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
                <AccountRow
                    icon={Globe}
                    label="Country / Region"
                    value={country}
                    action={editing === 'profile' ? <X size={18} aria-hidden /> : undefined}
                    onClick={() => {
                        clearMessages();
                        setEditing(editing === 'profile' ? null : 'profile');
                    }}
                />

                <AnimatePresence initial={false}>
                    {editing === 'profile' ? (
                        <motion.div
                            key="panel-profile"
                            initial={panelMotion.initial}
                            animate={panelMotion.animate}
                            exit={panelMotion.exit}
                            transition={panelTransition}
                            style={{ overflow: 'hidden', minHeight: 0 }}
                        >
                            <div className="glass-card account-edit-panel">
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        Full name
                                        <input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="auth-input auth-input--plain"
                                            placeholder="Your name"
                                            autoComplete="name"
                                        />
                                    </label>
                                    <label style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        Country / Region
                                        <CountrySelect
                                            id="account-country"
                                            value={country}
                                            onChange={setCountry}
                                        />
                                    </label>
                                    <div className="account-inline-btns">
                                        <button
                                            type="button"
                                            className="account-form-btn account-form-btn--primary"
                                            disabled={saving}
                                            onClick={handleSaveProfile}
                                        >
                                            <Check size={18} aria-hidden /> {saving ? 'Saving…' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            className="account-form-btn account-form-btn--secondary"
                                            onClick={() => setEditing(null)}
                                        >
                                            <X size={18} aria-hidden /> Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </AccountSection>
            </motion.div>
            </LayoutGroup>

            <div style={{ marginTop: '2rem' }}>
                <div style={{ borderTop: '1px solid var(--border-default)' }} />
                <AccountRow icon={LogOut} label="Log Out" isDestructive onClick={() => setShowLogoutConfirm(true)} />
            </div>

            {showLogoutConfirm ? (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Confirm log out"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1200,
                        background: 'var(--modal-backdrop)',
                        backdropFilter: 'blur(5px)',
                        display: 'grid',
                        placeItems: 'center',
                        padding: '1rem',
                    }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setShowLogoutConfirm(false)
                    }}
                >
                    <div className="glass-panel" style={{ width: 'min(460px, 92vw)', borderRadius: 16, padding: '1rem' }}>
                        <div style={{ fontWeight: 850, fontSize: '1.05rem' }}>Confirm logout</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5, fontSize: '0.92rem' }}>
                            {robotActive
                                ? 'The robot is still running. Logging out will not stop it. Continue?'
                                : 'You are about to sign out of your account. Continue?'}
                        </div>
                        <div className="account-inline-btns" style={{ justifyContent: 'flex-end', marginTop: '0.9rem' }}>
                            {robotActive ? (
                                <button
                                    type="button"
                                    className="account-form-btn account-form-btn--danger"
                                    onClick={() => {
                                        localStorage.setItem('robot:isActive', 'false')
                                        window.dispatchEvent(new CustomEvent('robot:active', { detail: { active: false } }))
                                        setRobotActive(false)
                                        setShowLogoutConfirm(false)
                                        setNotice('Robot stop signal sent. You can logout safely now.')
                                    }}
                                >
                                    Stop robot first
                                </button>
                            ) : null}
                            <button
                                type="button"
                                className="account-form-btn account-form-btn--secondary"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button type="button" className="account-form-btn account-form-btn--primary" onClick={handleLogOut}>
                                Log out anyway
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {notice || error ? (
                <div
                    className="glass-card"
                    role="status"
                    style={{
                        marginTop: '1.25rem',
                        padding: '0.9rem 1rem',
                        borderRadius: 14,
                        border: error ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255,255,255,0.1)',
                        background: error ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.04)',
                        color: error ? '#fecaca' : 'rgba(226, 232, 240, 0.9)',
                    }}
                >
                    {error || notice}
                </div>
            ) : null}

        </div>
    );
}

const Account = () => {
    return (
        <div className="fade-in" style={{ padding: '2rem', margin: '0 auto', paddingBottom: '4rem' }}>
            <AccountSettingsPanel embedded={false} />
        </div>
    )
}

export default Account;
