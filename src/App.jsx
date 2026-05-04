import { Component, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { FeedbackProvider, useFeedbackContext } from './context/FeedbackContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import OnboardingModal from './components/OnboardingModal'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NewMoonPage from './pages/NewMoonPage'
import NewMoonResultsPage from './pages/NewMoonResultsPage'
import FirstQuarterPage from './pages/FirstQuarterPage'
import FirstQuarterResultsPage from './pages/FirstQuarterResultsPage'
import FullMoonPage from './pages/FullMoonPage'
import FullMoonResultsPage from './pages/FullMoonResultsPage'
import WitnessSetupPage from './pages/WitnessSetupPage'
import WitnessPage from './pages/WitnessPage'
import AuthPage from './pages/AuthPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import MyResultsPage from './pages/MyResultsPage'
import ProfilePage from './pages/ProfilePage'
import AboutPage from './pages/AboutPage'
import InstrumentsPage from './pages/InstrumentsPage'
import RolesPage from './pages/RolesPage'
import SciencePage from './pages/SciencePage'
import FaqPage from './pages/FaqPage'
import PrivacyPage from './pages/PrivacyPage'
import GroupsPage from './pages/GroupsPage'
import LastQuarterPage from './pages/LastQuarterPage'
import FeedbackButton from './components/FeedbackButton'
import CookieBanner from './components/CookieBanner'
import AdminRoute from './components/AdminRoute'
import RequireAuth from './components/RequireAuth'
import AdminDashboardPage from './pages/AdminDashboardPage'

/** Top-level error boundary — catches unexpected render errors and shows a minimal fallback. */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log to console in development; replace with a reporting service (Sentry, etc.) if needed.
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
          <p className="text-gray-500 text-sm">Something went wrong. Please reload the page.</p>
          <button
            className="text-sm font-semibold text-[var(--mm-color-blue)] underline"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function AppContent() {
  const { itemContext } = useFeedbackContext()
  const { user, profile, loading, markOnboardingSeen } = useAuth()
  const navigate = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Show the onboarding modal once — on first sign-in for new users.
  useEffect(() => {
    if (loading || !user || !profile) return
    const localSeen = localStorage.getItem('cercol_onboarding_seen') === '1'
    if (!profile.onboarding_seen && !localSeen) {
      setShowOnboarding(true)
    }
  }, [user, profile, loading])

  function handleDismiss() {
    markOnboardingSeen()
    setShowOnboarding(false)
  }

  function handleGoToNewMoon() {
    markOnboardingSeen()
    setShowOnboarding(false)
    navigate('/new-moon')
  }

  return (
    <Layout>
      {showOnboarding && (
        <OnboardingModal onDismiss={handleDismiss} onGoToNewMoon={handleGoToNewMoon} />
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* New Moon */}
        <Route path="/new-moon" element={<NewMoonPage />} />
        <Route path="/new-moon/results" element={<NewMoonResultsPage />} />
        {/* First Quarter */}
        <Route path="/first-quarter" element={<FirstQuarterPage />} />
        <Route path="/first-quarter/results" element={<FirstQuarterResultsPage />} />
        {/* Full Moon */}
        <Route path="/full-moon" element={<FullMoonPage />} />
        <Route path="/full-moon/results" element={<FullMoonResultsPage />} />

        {/* Witness Cèrcol */}
        <Route path="/witness-setup" element={<RequireAuth><WitnessSetupPage /></RequireAuth>} />
        <Route path="/witness/:token" element={<WitnessPage />} />
        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        {/* Account — require authentication */}
        <Route path="/my-results" element={<RequireAuth><MyResultsPage /></RequireAuth>} />
        <Route path="/profile"    element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/groups"     element={<RequireAuth><GroupsPage /></RequireAuth>} />
        <Route path="/groups/:id" element={<RequireAuth><LastQuarterPage /></RequireAuth>} />
        {/* Documentation */}
        <Route path="/about"       element={<AboutPage />} />
        <Route path="/instruments" element={<InstrumentsPage />} />
        <Route path="/roles"       element={<RolesPage />} />
        <Route path="/science"     element={<SciencePage />} />
        <Route path="/faq"         element={<FaqPage />} />
        {/* Legal */}
        <Route path="/privacy"     element={<PrivacyPage />} />
        {/* Admin — guarded by AdminRoute, invisible to non-admins */}
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      </Routes>
      <FeedbackButton itemId={itemContext.itemId} itemText={itemContext.itemText} />
      <CookieBanner />
    </Layout>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <FeedbackProvider>
            <AppContent />
          </FeedbackProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
