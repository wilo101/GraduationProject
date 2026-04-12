Augustus OS — custom auth emails (no Supabase branding in the body)

Supabase sends signup / magic-link / reset emails. The BODY is edited in the dashboard; the FROM name needs Custom SMTP (optional).

1) Dashboard: https://supabase.com/dashboard → your project → Authentication → Email templates

2) For each template, paste the matching file from this folder:
   - Confirm signup        → confirm-signup.html   (Subject e.g. "Confirm your Augustus OS account")
   - Magic link            → magic-link.html       (Subject e.g. "Your Augustus OS sign-in link")
   - Reset password        → reset-password.html   (Subject e.g. "Reset your Augustus OS password")

3) Keep the Go template variables exactly as in the files: {{ .ConfirmationURL }} etc.

3b) Images: must be a full https:// URL. Supabase dashboard *preview* does not fill {{ .SiteURL }} reliably, so the logo uses a stable raw GitHub URL (raw.githubusercontent.com/…/main/public/email-logo.png). Update user/repo if you fork, or host the file on any CDN.

3c) Signup name in email: confirm-signup uses {{ .Data.full_name }} / {{ .Data.name }} — same keys as signUp({ options: { data: { full_name, name }}}) in Register.jsx. If the name is empty, the line falls back to “Hello,”.

4) Site URL & redirects: Authentication → URL Configuration — set Site URL to your live app (e.g. GitHub Pages URL). Add the same to Redirect URLs. Your app already sends emailRedirectTo from code.

5) Sender name "Augustus OS" (not "Supabase"): Project Settings → Auth → SMTP Settings — use Custom SMTP (SendGrid, Resend, AWS SES, …) and set Sender name to "Augustus OS" and a noreply@yourdomain.com address. Free tier Supabase email uses a generic pipeline; custom SMTP gives full control.

6) Rate limits: if you hit "email rate limit exceeded", wait or disable "Confirm email" for testing, or use custom SMTP.
