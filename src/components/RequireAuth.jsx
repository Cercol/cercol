/**
 * RequireAuth — renders children only for authenticated users.
 * Unauthenticated users are redirected to /auth.
 * Shows nothing while the initial session check is in progress to prevent
 * a flash-redirect on hard refresh while the JWT is being validated.
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user)   return <Navigate to="/auth" replace />

  return children
}
