/**
 * Human-friendly copy for common Supabase Auth API errors.
 */
export function formatSupabaseAuthError(message) {
    if (!message) return 'Something went wrong. Please try again.'
    const lower = String(message).toLowerCase()

    if (lower.includes('rate limit') || lower.includes('too many')) {
        return (
            'تم تجاوز حد إرسال الإيميل مؤقتًا (حد من Supabase). جرّب بعد نحو ساعة، أو من لوحة Supabase: Authentication → Providers → Email عطّل "Confirm email" أثناء التجربة، أو أضف Custom SMTP في إعدادات المشروع لرفع الحد. ' +
            '— Email rate limit exceeded: wait ~1 hour, turn off email confirmation for testing, or add custom SMTP in Supabase.'
        )
    }

    if (lower.includes('already registered') || lower.includes('user already')) {
        return 'يوجد حساب بهذا البريد بالفعل. جرّب تسجيل الدخول. — An account with this email already exists. Try signing in.'
    }

    return message
}
