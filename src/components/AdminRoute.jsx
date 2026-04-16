/**
 * AdminRoute — renders children only for users with is_admin = true.
 * Non-admin users (including unauthenticated) are silently redirected to /.
 * Shows nothing while the initial auth check is loading.
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { profile, loading } = useAuth()

  // Wait for the session + profile to resolve before making the decision.
  // This prevents a flash-redirect on hard refresh while the JWT is being validated.
  if (loading) return null

  if (!profile?.is_admin) return <Navigate to="/" replace />

  return children
}
