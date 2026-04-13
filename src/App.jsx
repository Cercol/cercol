import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FeedbackProvider, useFeedbackContext } from './context/FeedbackContext'
import { AuthProvider } from './context/AuthContext'
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

function AppContent() {
  const { itemContext } = useFeedbackContext()
  return (
    <Layout>
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
        <Route path="/full-moon/report" element={<Navigate to="/full-moon/results" replace />} />
        {/* Witness Cèrcol */}
        <Route path="/witness-setup" element={<WitnessSetupPage />} />
        <Route path="/witness/:token" element={<WitnessPage />} />
        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        {/* Account */}
        <Route path="/my-results" element={<MyResultsPage />} />
        <Route path="/profile"    element={<ProfilePage />} />
        <Route path="/groups"     element={<GroupsPage />} />
        <Route path="/groups/:id" element={<LastQuarterPage />} />
        {/* Documentation */}
        <Route path="/about"       element={<AboutPage />} />
        <Route path="/instruments" element={<InstrumentsPage />} />
        <Route path="/roles"       element={<RolesPage />} />
        <Route path="/science"     element={<SciencePage />} />
        <Route path="/faq"         element={<FaqPage />} />
        {/* Legal */}
        <Route path="/privacy"     element={<PrivacyPage />} />
      </Routes>
      <FeedbackButton itemId={itemContext.itemId} itemText={itemContext.itemText} />
      <CookieBanner />
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <FeedbackProvider>
          <AppContent />
        </FeedbackProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
