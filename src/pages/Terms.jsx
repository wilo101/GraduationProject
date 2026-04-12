import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
    return (
        <div className="auth-legal-page fade-in">
            <Link to="/login" className="auth-back-link">
                <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
                Back to sign in
            </Link>
            <h1>Terms of service</h1>
            <p>
                By using this interface you accept that it is provided as-is for evaluation and graduation work. Robot
                and facility / robotics features shown here are illustrative. Ship a lawyer-reviewed agreement before
                inviting real users.
            </p>
        </div>
    )
}
