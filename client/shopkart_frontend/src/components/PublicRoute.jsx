import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from "react-router-dom"


function PublicRoute({ children }) {
    // we check for user Data - authenticated user Data is here
    const { user } = useAuth()

    //    navigate to home
    if (user) {
        return <Navigate to='/home' />
    }

    // if not we stay on children - login signup or lanidng

    return children

}

export default PublicRoute