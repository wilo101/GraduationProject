/**
 * Human-friendly copy for common Supabase Auth API errors.
 */
export function formatSupabaseAuthError(message) {
    if (!message) return 'Something went wrong. Please try again.'
    const lower = String(message).toLowerCase()

    if (lower.includes('rate limit') || lower.includes('too many')) {
        return (
            'Email rate limit exceeded. Wait about an hour, or in Supabase: Authentication → Providers → Email turn off “Confirm email” for testing, or add Custom SMTP to raise the limit.'
        )
    }

    if (lower.includes('already registered') || lower.includes('user already')) {
        return 'An account with this email already exists. Try signing in.'
    }

    return message
}
