import React, { useEffect, useMemo, useState } from 'react'
import { User, Mail, Lock, ArrowRight, Phone } from 'lucide-react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthScreenShell from '../components/AuthScreenShell'
import { formatSupabaseAuthError } from '../lib/authErrors'
import { consumeOAuthSearchParamsIfError, getAuthRedirectUrl, isSupabaseConfigured, supabase } from '../lib/supabase'

const googleIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
)

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const phoneOk = (v) => /^\+\d{8,15}$/.test(v.trim())
const ICON = 1.75

export default function Register() {
    const { isAuthenticated, loading } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const oauthError = searchParams.get('error')
    const canUseSupabase = useMemo(() => Boolean(supabase), [])

    const [method, setMethod] = useState('email') // 'email' | 'phone'
    const isEmail = method === 'email'
    const isPhone = method === 'phone'

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)

    const [errors, setErrors] = useState({ fullName: '', email: '', password: '', phone: '', otp: '' })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fromQuery = consumeOAuthSearchParamsIfError()
        if (fromQuery) {
            setFormError(formatSupabaseAuthError(fromQuery) || fromQuery)
        }
    }, [])

    if (!loading && isAuthenticated) return <Navigate to="/" replace />

    const resetErrors = () => setErrors({ fullName: '', email: '', password: '', phone: '', otp: '' })

    const handleEmailSignup = async (e) => {
        e.preventDefault()
        setFormError('')
        resetErrors()
        const next = { fullName: '', email: '', password: '', phone: '', otp: '' }
        if (fullName.trim().length < 2) next.fullName = 'Enter your first and last name.'
        if (!email.trim()) next.email = 'Email is required.'
        else if (!emailOk(email)) next.email = 'Use a valid email address.'
        if (!password) next.password = 'Choose a password.'
        else if (password.length < 8) next.password = 'Use at least 8 characters.'
        setErrors(next)
        if (next.fullName || next.email || next.password) return

        if (!canUseSupabase) {
            setFormError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env')
            return
        }

        setSubmitting(true)
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: { full_name: fullName.trim(), name: fullName.trim() },
                    emailRedirectTo: getAuthRedirectUrl(),
                },
            })
            if (error) {
                setFormError(formatSupabaseAuthError(error.message))
                return
            }
            if (data.session) {
                navigate('/')
                return
            }
            /* Email confirmation required — send user to sign-in with email prefilled + friendly hint */
            navigate('/login', {
                state: {
                    fromRegistration: true,
                    prefilledEmail: email.trim(),
                },
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleSendOtp = async (e) => {
        e.preventDefault()
        setFormError('')
        resetErrors()

        const next = { fullName: '', email: '', password: '', phone: '', otp: '' }
        if (fullName.trim().length < 2) next.fullName = 'Enter your first and last name.'
        const p = phone.trim()
        if (!p) next.phone = 'Enter your phone number in international format (e.g. +2010...).'
        else if (!phoneOk(p)) next.phone = 'Use international format like +2010... (numbers only).'
        setErrors(next)
        if (next.fullName || next.phone) return

        if (!canUseSupabase) {
            setFormError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env')
            return
        }

        setSubmitting(true)
        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: p,
                options: { data: { full_name: fullName.trim(), name: fullName.trim() } },
            })
            if (error) {
                setFormError(formatSupabaseAuthError(error.message))
                return
            }
            setOtpSent(true)
            setFormError('We sent a verification code to your phone.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setFormError('')
        resetErrors()

        const next = { fullName: '', email: '', password: '', phone: '', otp: '' }
        const p = phone.trim()
        const t = otp.trim()
        if (fullName.trim().length < 2) next.fullName = 'Enter your first and last name.'
        if (!p) next.phone = 'Phone number is required.'
        else if (!phoneOk(p)) next.phone = 'Use international format like +2010... (numbers only).'
        if (!t) next.otp = 'Enter the 6-digit code.'
        else if (!/^\d{6}$/.test(t)) next.otp = 'Code must be 6 digits.'
        setErrors(next)
        if (next.fullName || next.phone || next.otp) return

        if (!canUseSupabase) {
            setFormError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env')
            return
        }

        setSubmitting(true)
        try {
            const { error } = await supabase.auth.verifyOtp({
                phone: p,
                token: t,
                type: 'sms',
            })
            if (error) {
                setFormError(formatSupabaseAuthError(error.message))
                return
            }
            navigate('/')
        } finally {
            setSubmitting(false)
        }
    }

    const handleGoogle = async () => {
        setFormError('')
        if (!supabase) {
            setFormError('Add Supabase keys in .env (see .env.example).')
            return
        }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getAuthRedirectUrl(),
                queryParams: { prompt: 'select_account' },
            },
        })
        if (error) setFormError(formatSupabaseAuthError(error.message))
    }

    return (
        <AuthScreenShell>
            <header>
                <h1 className="auth-display">Create account</h1>
                <p className="auth-lede">One profile ties your robot sessions, maps, and alerts together.</p>
                {!isSupabaseConfigured() ? (
                    <p className="form-error" role="alert" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a root .env file.
                    </p>
                ) : null}
                {oauthError === 'google' ? (
                    <p className="form-error" role="alert" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        Google sign-in failed. Enable the Google provider in Supabase (Client ID and Secret from Google
                        Cloud) and add this URL to Supabase Redirect URLs: {getAuthRedirectUrl()}
                    </p>
                ) : null}
                {formError ? (
                    <p className="form-error" role="alert" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        {formError}
                    </p>
                ) : null}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <button
                    type="button"
                    className="auth-social-btn"
                    onClick={() => {
                        setMethod('email')
                        setFormError('')
                        resetErrors()
                        setOtpSent(false)
                        setOtp('')
                    }}
                    style={{
                        justifyContent: 'center',
                        border: isEmail ? '1px solid rgba(99,102,241,.55)' : undefined,
                        background: isEmail ? 'rgba(99,102,241,.12)' : undefined,
                    }}
                >
                    <Mail size={18} aria-hidden />
                    Email
                </button>
                <button
                    type="button"
                    className="auth-social-btn"
                    onClick={() => {
                        setMethod('phone')
                        setFormError('')
                        resetErrors()
                        setOtpSent(false)
                        setOtp('')
                    }}
                    style={{
                        justifyContent: 'center',
                        border: isPhone ? '1px solid rgba(99,102,241,.55)' : undefined,
                        background: isPhone ? 'rgba(99,102,241,.12)' : undefined,
                    }}
                >
                    <Phone size={18} aria-hidden />
                    Phone
                </button>
            </div>

            <form
                id="auth-form"
                className="auth-form"
                onSubmit={isEmail ? handleEmailSignup : otpSent ? handleVerifyOtp : handleSendOtp}
                noValidate
            >
                <div>
                    <label className="auth-field-label" htmlFor="register-name">
                        Full name
                    </label>
                    <div className="auth-input-wrap">
                        <User className="auth-icon" size={20} strokeWidth={ICON} aria-hidden />
                        <input
                            id="register-name"
                            className="auth-input"
                            type="text"
                            autoComplete="name"
                            placeholder="Mohamed Marey"
                            value={fullName}
                            onChange={(e) => {
                                setFullName(e.target.value)
                                if (errors.fullName) setErrors((s) => ({ ...s, fullName: '' }))
                            }}
                            aria-invalid={Boolean(errors.fullName)}
                            aria-describedby={errors.fullName ? 'register-name-err' : undefined}
                        />
                    </div>
                    {errors.fullName ? (
                        <p id="register-name-err" className="form-error" role="alert">
                            {errors.fullName}
                        </p>
                    ) : null}
                </div>

                {isEmail ? (
                    <>
                        <div>
                            <label className="auth-field-label" htmlFor="register-email">
                                Email address
                            </label>
                            <div className="auth-input-wrap">
                                <Mail className="auth-icon" size={20} strokeWidth={ICON} aria-hidden />
                                <input
                                    id="register-email"
                                    className="auth-input"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="mohamed.marey@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (errors.email) setErrors((s) => ({ ...s, email: '' }))
                                    }}
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={errors.email ? 'register-email-err' : undefined}
                                />
                            </div>
                            {errors.email ? (
                                <p id="register-email-err" className="form-error" role="alert">
                                    {errors.email}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="auth-field-label" htmlFor="register-password">
                                Password
                            </label>
                            <div className="auth-input-wrap">
                                <Lock className="auth-icon" size={20} strokeWidth={ICON} aria-hidden />
                                <input
                                    id="register-password"
                                    className="auth-input"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        if (errors.password) setErrors((s) => ({ ...s, password: '' }))
                                    }}
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={errors.password ? 'register-password-err' : undefined}
                                />
                            </div>
                            {errors.password ? (
                                <p id="register-password-err" className="form-error" role="alert">
                                    {errors.password}
                                </p>
                            ) : null}
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="auth-field-label" htmlFor="register-phone">
                                Phone number
                            </label>
                            <div className="auth-input-wrap">
                                <Phone className="auth-icon" size={20} strokeWidth={ICON} aria-hidden />
                                <input
                                    id="register-phone"
                                    className="auth-input"
                                    type="tel"
                                    autoComplete="tel"
                                    placeholder="+2010XXXXXXXXX"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value)
                                        if (errors.phone) setErrors((s) => ({ ...s, phone: '' }))
                                    }}
                                    aria-invalid={Boolean(errors.phone)}
                                    aria-describedby={errors.phone ? 'register-phone-err' : undefined}
                                />
                            </div>
                            {errors.phone ? (
                                <p id="register-phone-err" className="form-error" role="alert">
                                    {errors.phone}
                                </p>
                            ) : null}
                        </div>

                        {otpSent ? (
                            <div>
                                <label className="auth-field-label" htmlFor="register-otp">
                                    Verification code
                                </label>
                                <div className="auth-input-wrap">
                                    <Lock className="auth-icon" size={20} strokeWidth={ICON} aria-hidden />
                                    <input
                                        id="register-otp"
                                        className="auth-input"
                                        inputMode="numeric"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => {
                                            setOtp(e.target.value)
                                            if (errors.otp) setErrors((s) => ({ ...s, otp: '' }))
                                        }}
                                        aria-invalid={Boolean(errors.otp)}
                                        aria-describedby={errors.otp ? 'register-otp-err' : undefined}
                                    />
                                </div>
                                {errors.otp ? (
                                    <p id="register-otp-err" className="form-error" role="alert">
                                        {errors.otp}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                    </>
                )}

                <button type="submit" className="auth-primary-btn" disabled={submitting}>
                    {submitting
                        ? isEmail
                            ? 'Creating account…'
                            : otpSent
                              ? 'Verifying…'
                              : 'Sending…'
                        : isEmail
                          ? 'Create account'
                          : otpSent
                            ? 'Verify code'
                            : 'Send code'}{' '}
                    {!submitting ? <ArrowRight size={20} strokeWidth={ICON} aria-hidden /> : null}
                </button>

                {isPhone && otpSent ? (
                    <button
                        type="button"
                        className="auth-social-btn"
                        onClick={() => {
                            setOtpSent(false)
                            setOtp('')
                            setFormError('')
                            resetErrors()
                        }}
                        style={{ justifyContent: 'center' }}
                    >
                        Change phone / resend
                    </button>
                ) : null}
            </form>

            <div className="auth-divider" role="separator">
                <span>Or continue with</span>
            </div>

            <div className="auth-social-row">
                <button type="button" className="auth-social-btn" onClick={handleGoogle}>
                    {googleIcon}
                    Google
                </button>
            </div>

            <footer className="auth-footer">
                <span style={{ color: 'var(--text-secondary)' }}>Already registered? </span>
                <Link to="/login" className="auth-footer-link">
                    Sign in
                </Link>
            </footer>
        </AuthScreenShell>
    )
}
