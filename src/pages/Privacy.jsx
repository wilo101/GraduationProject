import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Privacy() {
    return (
        <div className="auth-legal-page fade-in">
            <Link to="/login" className="auth-back-link">
                <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
                Back to sign in
            </Link>
            <h1>Privacy policy</h1>
            <p>
                This build is a demo dashboard. Account data you enter here is stored only in your browser for
                session purposes unless you connect a real backend. Before production, replace this page with a
                policy that matches your data practices and jurisdiction.
            </p>
        </div>
    )
}
