import { Component, lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { FeedbackProvider, useFeedbackContext } from './context/FeedbackContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import OnboardingModal from './components/OnboardingModal'
import Layout from './components/Layout'
import PageLoader from './components/PageLoader'
import FeedbackButton from './components/FeedbackButton'
import CookieBanner from './components/CookieBanner'
import AdminRoute from './components/AdminRoute'
import RequireAuth from './components/RequireAuth'

// HomePage is eager — it is the first visible page for most visitors.
import HomePage from './pages/HomePage'

// ── Instrument pages (one chunk per test + its results page) ─────────────────
const NewMoonPage         = lazy(() => import('./pages/NewMoonPage'))
const NewMoonResultsPage  = lazy(() => import('./pages/NewMoonResultsPage'))

const FirstQuarterPage        = lazy(() => import('./pages/FirstQuarterPage'))
const FirstQuarterResultsPage = lazy(() => import('./pages/FirstQuarterResultsPage'))

const FullMoonPage        = lazy(() => import('./pages/FullMoonPage'))
const FullMoonResultsPage = lazy(() => import('./pages/FullMoonResultsPage'))

// ── Witness (shared chunk — setup and assessment are always used together) ───
const WitnessSetupPage = lazy(() => import('./pages/WitnessSetupPage'))
const WitnessPage      = lazy(() => import('./pages/WitnessPage'))

// ── Auth ─────────────────────────────────────────────────────────────────────
const AuthPage         = lazy(() => import('./pages/AuthPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))

// ── Account pages (require auth — loaded only after sign-in) ─────────────────
const MyResultsPage  = lazy(() => import('./pages/MyResultsPage'))
const ProfilePage    = lazy(() => import('./pages/ProfilePage'))
const GroupsPage     = lazy(() => import('./pages/GroupsPage'))
const LastQuarterPage = lazy(() => import('./pages/LastQuarterPage'))

// ── Documentation (static, rarely visited on first load) ─────────────────────
const AboutPage       = lazy(() => import('./pages/AboutPage'))
const InstrumentsPage = lazy(() => import('./pages/InstrumentsPage'))
const RolesPage       = lazy(() => import('./pages/RolesPage'))
const SciencePage     = lazy(() => import('./pages/SciencePage'))
const FaqPage         = lazy(() => import('./pages/FaqPage'))
const PrivacyPage     = lazy(() => import('./pages/PrivacyPage'))

// ── Blog (dynamic — fetches from backend API) ─────────────────────────────────
const BlogIndexPage   = lazy(() => import('./pages/BlogIndexPage'))
const BlogArticlePage = lazy(() => import('./pages/blog/BlogArticlePage'))

// ── Admin (never part of the public bundle) ───────────────────────────────────
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))


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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* New Moon */}
          <Route path="/new-moon"         element={<NewMoonPage />} />
          <Route path="/new-moon/results" element={<NewMoonResultsPage />} />

          {/* First Quarter */}
          <Route path="/first-quarter"         element={<FirstQuarterPage />} />
          <Route path="/first-quarter/results" element={<FirstQuarterResultsPage />} />

          {/* Full Moon */}
          <Route path="/full-moon"         element={<FullMoonPage />} />
          <Route path="/full-moon/results" element={<FullMoonResultsPage />} />

          {/* Witness Cèrcol */}
          <Route path="/witness-setup"   element={<RequireAuth><WitnessSetupPage /></RequireAuth>} />
          <Route path="/witness/:token"  element={<WitnessPage />} />

          {/* Auth */}
          <Route path="/auth"          element={<AuthPage />} />
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

          {/* Blog */}
          <Route path="/blog"       element={<BlogIndexPage />} />
          <Route path="/blog/:slug" element={<Suspense fallback={null}><BlogArticlePage /></Suspense>} />
          {['ca', 'es', 'fr', 'de', 'da'].flatMap(lang => [
            <Route key={`${lang}-blog`}      path={`/${lang}/blog`}        element={<Suspense fallback={null}><BlogIndexPage /></Suspense>} />,
            <Route key={`${lang}-blog-slug`} path={`/${lang}/blog/:slug`}  element={<Suspense fallback={null}><BlogArticlePage /></Suspense>} />,
          ])}

          {/* Legal */}
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Admin — guarded by AdminRoute, invisible to non-admins */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        </Routes>
      </Suspense>
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
