import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100dvh',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-body)',
                }}
            >
                Loading…
            </div>
        )
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />
    return children
}
