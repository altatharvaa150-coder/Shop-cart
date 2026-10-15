import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    // Wait for auth check to complete before deciding
    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to='/login' />
    }

    return children
}

export default ProtectedRoute