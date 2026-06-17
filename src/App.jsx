import { Component, lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import i18n from './i18n'
import { PATH_LANGS, localeFromPath } from './utils/locale'
import { trackEvent, getAnonId } from './lib/api'
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
const SampleReportPage = lazy(() => import('./pages/SampleReportPage'))

// ── Blog (dynamic — fetches from backend API) ─────────────────────────────────
const BlogIndexPage   = lazy(() => import('./pages/BlogIndexPage'))
const BlogArticlePage = lazy(() => import('./pages/blog/BlogArticlePage'))

// ── Share landing (prerendered per role; previews the user's animal) ──────────
const SharePage = lazy(() => import('./pages/SharePage'))

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

// Top-level public pages that exist in every language as a real path
// (prerendered per locale). Home is keyed by '/'. The instrument-taking
// pages, witness flow, auth, account and admin are intentionally excluded:
// they are interactive/private/per-token and are not indexable SEO targets.
const TOP_LEVEL_PAGES = [
  { path: '/about',       element: <AboutPage /> },
  { path: '/instruments', element: <InstrumentsPage /> },
  { path: '/roles',       element: <RolesPage /> },
  { path: '/science',     element: <SciencePage /> },
  { path: '/faq',         element: <FaqPage /> },
  { path: '/privacy',     element: <PrivacyPage /> },
  { path: '/sample',      element: <SampleReportPage /> },
]

/**
 * Keep i18n and <html lang> in sync with the URL. Priority: path prefix
 * (/es/...) > ?lang= query > whatever i18n already resolved (localStorage /
 * browser, set in i18n.js). A plain English path with no query does NOT
 * force a change, so a returning visitor with a saved preference is not
 * reset to English when they land on an unprefixed page.
 */
function useLocaleSync() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    const pathLang = localeFromPath(pathname)
    const queryLang = new URLSearchParams(search).get('lang')
    const target = pathLang !== 'en'
      ? pathLang
      : (PATH_LANGS.includes(queryLang) ? queryLang : null)
    if (target && i18n.language.slice(0, 2) !== target) {
      i18n.changeLanguage(target)
    }
    // Reflect the effective language on the document so the prerendered
    // HTML ships <html lang="<locale>"> instead of always "en".
    const effective = target || i18n.language.slice(0, 2) || 'en'
    if (typeof document !== 'undefined') {
      document.documentElement.lang = effective
    }
  }, [pathname, search])
}

/**
 * Fire a first-party page_view event on every route change. This is the only
 * general page-visit signal (there is no third-party analytics); it feeds the
 * weekly digest funnel. trackEvent is prerender-guarded and fire-and-forget,
 * so bots/build are excluded and it no-ops until migration 026 lands.
 */
function usePageViewTracking() {
  const { pathname } = useLocation()
  useEffect(() => {
    trackEvent('page_view', {
      path: pathname,
      lang: i18n.language.slice(0, 2) || 'en',
      anon_id: getAnonId(),
    })
  }, [pathname])
}

function AppContent() {
  const { itemContext } = useFeedbackContext()
  const { user, profile, loading, markOnboardingSeen } = useAuth()
  const navigate = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState(false)
  useLocaleSync()
  usePageViewTracking()

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
          <Route path="/sample"      element={<SampleReportPage />} />

          {/* Blog */}
          <Route path="/blog"       element={<BlogIndexPage />} />
          <Route path="/blog/:slug" element={<Suspense fallback={null}><BlogArticlePage /></Suspense>} />
          {['ca', 'es', 'fr', 'de', 'da'].flatMap(lang => [
            <Route key={`${lang}-blog`}      path={`/${lang}/blog`}        element={<Suspense fallback={null}><BlogIndexPage /></Suspense>} />,
            <Route key={`${lang}-blog-slug`} path={`/${lang}/blog/:slug`}  element={<Suspense fallback={null}><BlogArticlePage /></Suspense>} />,
          ])}

          {/* Share landing — prerendered per role, previews the user's animal */}
          <Route path="/share/:roleId" element={<Suspense fallback={null}><SharePage /></Suspense>} />

          {/* Legal */}
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Path-based localized top-level pages: /es/, /es/about/, ... .
              EN keeps the unprefixed routes declared above; these add the
              five prefixed languages, reusing the same page components. */}
          {PATH_LANGS.flatMap(lang => [
            <Route key={`${lang}-home`} path={`/${lang}`} element={<HomePage />} />,
            ...TOP_LEVEL_PAGES.map(p => (
              <Route key={`${lang}-${p.path}`} path={`/${lang}${p.path}`} element={p.element} />
            )),
          ])}

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
