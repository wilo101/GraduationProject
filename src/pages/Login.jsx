import React, { useEffect, useMemo, useState } from 'react'
import { Mail, Lock, ArrowRight, Phone } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
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

export default function Login() {
    const { isAuthenticated, loading } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const oauthError = searchParams.get('error')
    const [method, setMethod] = useState('email') // 'email' | 'phone'
    const isEmail = method === 'email'
    const isPhone = method === 'phone'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)

    const [errors, setErrors] = useState({ email: '', password: '', phone: '', otp: '' })
    const [formError, setFormError] = useState('')
    /** Banner tone: notice = soft guidance, info = positive/update, alert = configuration / serious */
    const [formErrorVariant, setFormErrorVariant] = useState('alert')
    const [postRegisterHint, setPostRegisterHint] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const location = useLocation()

    const setFlash = (text, variant = 'alert') => {
        setFormError(text)
        setFormErrorVariant(variant)
    }

    const clearFlash = () => setFormError('')

    useEffect(() => {
        const fromQuery = consumeOAuthSearchParamsIfError()
        if (fromQuery) {
            setFlash(formatSupabaseAuthError(fromQuery) || fromQuery, 'alert')
        }
    }, [])

    useEffect(() => {
        const st = location.state
        if (st?.fromRegistration && st?.prefilledEmail) {
            setEmail(st.prefilledEmail)
            setPostRegisterHint(true)
            setFormError('')
            navigate('.', { replace: true, state: {} })
        }
    }, [location.state, navigate])

    if (!loading && isAuthenticated) return <Navigate to="/" replace />

    const canUseSupabase = useMemo(() => Boolean(supabase), [])

    const resetErrors = () => setErrors({ email: '', password: '', phone: '', otp: '' })

    const handleEmailLogin = async (e) => {
        e.preventDefault()
        clearFlash()
        resetErrors()

        const next = { email: '', password: '', phone: '', otp: '' }
        if (!email.trim()) next.email = 'Enter the email you signed up with.'
        else if (!emailOk(email)) next.email = 'That does not look like a valid email address.'
        if (!password) next.password = 'Password is required.'
        else if (password.length < 8) next.password = 'Use at least 8 characters.'
        setErrors(next)
        if (next.email || next.password) return

        if (!canUseSupabase) {
            setFlash('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env', 'alert')
            return
        }

        setSubmitting(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            })
            if (error) {
                if (error.message === 'Invalid login credentials') {
                    setFlash(
                        'We couldn’t sign you in with that email and password. Check the password, or confirm your email first if you just registered.',
                        'notice'
                    )
                } else {
                    setFlash(formatSupabaseAuthError(error.message), 'alert')
                }
                return
            }
            navigate('/')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSendOtp = async (e) => {
        e.preventDefault()
        clearFlash()
        resetErrors()

        const next = { email: '', password: '', phone: '', otp: '' }
        const p = phone.trim()
        if (!p) next.phone = 'Enter your phone number in international format (e.g. +2010...).'
        else if (!phoneOk(p)) next.phone = 'Use international format like +2010... (numbers only).'
        setErrors(next)
        if (next.phone) return

        if (!canUseSupabase) {
            setFlash('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env', 'alert')
            return
        }

        setSubmitting(true)
        try {
            const { error } = await supabase.auth.signInWithOtp({ phone: p })
            if (error) {
                setFlash(formatSupabaseAuthError(error.message), 'alert')
                return
            }
            setOtpSent(true)
            setFlash('We sent a verification code to your phone.', 'info')
        } finally {
            setSubmitting(false)
        }
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        clearFlash()
        resetErrors()

        const next = { email: '', password: '', phone: '', otp: '' }
        const p = phone.trim()
        const t = otp.trim()
        if (!p) next.phone = 'Phone number is required.'
        else if (!phoneOk(p)) next.phone = 'Use international format like +2010... (numbers only).'
        if (!t) next.otp = 'Enter the 6-digit code.'
        else if (!/^\d{6}$/.test(t)) next.otp = 'Code must be 6 digits.'
        setErrors(next)
        if (next.phone || next.otp) return

        if (!canUseSupabase) {
            setFlash('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env', 'alert')
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
                setFlash(formatSupabaseAuthError(error.message), 'alert')
                return
            }
            navigate('/')
        } finally {
            setSubmitting(false)
        }
    }

    const handleGoogle = async () => {
        clearFlash()
        if (!supabase) {
            setFlash('Add Supabase keys in .env (see .env.example).', 'alert')
            return
        }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getAuthRedirectUrl(),
                queryParams: { prompt: 'select_account' },
            },
        })
        if (error) setFlash(formatSupabaseAuthError(error.message), 'alert')
    }

    return (
        <AuthScreenShell>
            <header>
                <h1 className="auth-display">Welcome back</h1>
                <p className="auth-lede">Use your Augustus credentials. Maps and feeds load after you sign in.</p>
                {postRegisterHint ? (
                    <p className="auth-flash auth-flash--info" role="status">
                        Check your inbox for a confirmation link, then sign in here with the same password. After that,
                        you’ll stay signed in on this device.
                    </p>
                ) : null}
                {!isSupabaseConfigured() ? (
                    <p className="auth-flash auth-flash--alert" role="alert">
                        Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a root .env file (copy from .env.example).
                    </p>
                ) : null}
                {oauthError === 'google' ? (
                    <p className="auth-flash auth-flash--alert" role="alert">
                        Google sign-in failed. Enable the Google provider in Supabase and add this URL to Redirect URLs:{' '}
                        {getAuthRedirectUrl()}
                    </p>
                ) : null}
                {oauthError === 'token' ? (
                    <p className="auth-flash auth-flash--alert" role="alert">
                        Session link was invalid. Try signing in again.
                    </p>
                ) : null}
                {formError ? (
                    <p className={`auth-flash auth-flash--${formErrorVariant}`} role="alert">
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
                        clearFlash()
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
                        clearFlash()
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

            {isEmail ? (
                <form id="auth-form" className="auth-form" onSubmit={handleEmailLogin} noValidate>
                    <div>
                        <label className="auth-field-label" htmlFor="login-email">
                            Email address
                        </label>
                        <div className="auth-input-wrap">
                            <Mail className="auth-icon" size={20} strokeWidth={ICON} aria-hidden />
                            <input
                                id="login-email"
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
                                aria-describedby={errors.email ? 'login-email-err' : undefined}
                            />
                        </div>
                        {errors.email ? (
                            <p id="login-email-err" className="form-error" role="alert">
                                {errors.email}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <div className="auth-row-label">
                            <label className="auth-field-label" htmlFor="login-password">
                                Password
                            </label>
                            <button type="button" className="auth-forgot">
                                Forgot password
                            </button>
                        </div>
                        <div className="auth-input-wrap">
                            <Lock className="auth-icon" size={20} strokeWidth={ICON} aria-hidden />
                            <input
                                id="login-password"
                                className="auth-input"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (errors.password) setErrors((s) => ({ ...s, password: '' }))
                                }}
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={errors.password ? 'login-password-err' : undefined}
                            />
                        </div>
                        {errors.password ? (
                            <p id="login-password-err" className="form-error" role="alert">
                                {errors.password}
                            </p>
                        ) : null}
                    </div>

                    <button type="submit" className="auth-primary-btn" disabled={submitting}>
                        {submitting ? 'Signing in…' : 'Sign in'}{' '}
                        {!submitting ? <ArrowRight size={20} strokeWidth={ICON} aria-hidden /> : null}
                    </button>
                </form>
            ) : (
                <form id="auth-form" className="auth-form" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} noValidate>
                    <div>
                        <label className="auth-field-label" htmlFor="login-phone">
                            Phone number
                        </label>
                        <div className="auth-input-wrap">
                            <Phone className="auth-icon" size={20} strokeWidth={ICON} aria-hidden />
                            <input
                                id="login-phone"
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
                                aria-describedby={errors.phone ? 'login-phone-err' : undefined}
                            />
                        </div>
                        {errors.phone ? (
                            <p id="login-phone-err" className="form-error" role="alert">
                                {errors.phone}
                            </p>
                        ) : null}
                    </div>

                    {otpSent ? (
                        <div>
                            <label className="auth-field-label" htmlFor="login-otp">
                                Verification code
                            </label>
                            <div className="auth-input-wrap">
                                <Lock className="auth-icon" size={20} strokeWidth={ICON} aria-hidden />
                                <input
                                    id="login-otp"
                                    className="auth-input"
                                    inputMode="numeric"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value)
                                        if (errors.otp) setErrors((s) => ({ ...s, otp: '' }))
                                    }}
                                    aria-invalid={Boolean(errors.otp)}
                                    aria-describedby={errors.otp ? 'login-otp-err' : undefined}
                                />
                            </div>
                            {errors.otp ? (
                                <p id="login-otp-err" className="form-error" role="alert">
                                    {errors.otp}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    <button type="submit" className="auth-primary-btn" disabled={submitting}>
                        {submitting ? (otpSent ? 'Verifying…' : 'Sending…') : otpSent ? 'Verify code' : 'Send code'}{' '}
                        {!submitting ? <ArrowRight size={20} strokeWidth={ICON} aria-hidden /> : null}
                    </button>

                    {otpSent ? (
                        <button
                            type="button"
                            className="auth-social-btn"
                            onClick={() => {
                                setOtpSent(false)
                                setOtp('')
                                clearFlash()
                                resetErrors()
                            }}
                            style={{ justifyContent: 'center' }}
                        >
                            Change phone / resend
                        </button>
                    ) : null}
                </form>
            )}

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
                <span style={{ color: 'var(--text-secondary)' }}>No account yet? </span>
                <Link to="/register" className="auth-footer-link">
                    Create account
                </Link>
            </footer>
        </AuthScreenShell>
    )
}
