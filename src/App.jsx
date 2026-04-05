import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FeedbackProvider, useFeedbackContext } from './context/FeedbackContext'
import HomePage from './pages/HomePage'
import NewMoonPage from './pages/NewMoonPage'
import NewMoonResultsPage from './pages/NewMoonResultsPage'
import WaxingCrescentPage from './pages/WaxingCrescentPage'
import WaxingCrescentResultsPage from './pages/WaxingCrescentResultsPage'
import FeedbackButton from './components/FeedbackButton'

function AppContent() {
  const { itemContext } = useFeedbackContext()
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* New Moon (formerly Radar) */}
        <Route path="/new-moon" element={<NewMoonPage />} />
        <Route path="/new-moon/results" element={<NewMoonResultsPage />} />
        {/* Legacy radar routes — kept for backward compat with shared links */}
        <Route path="/radar" element={<NewMoonPage />} />
        <Route path="/radar/results" element={<NewMoonResultsPage />} />
        {/* Waxing Crescent */}
        <Route path="/waxing-crescent" element={<WaxingCrescentPage />} />
        <Route path="/waxing-crescent/results" element={<WaxingCrescentResultsPage />} />
      </Routes>
      <FeedbackButton itemId={itemContext.itemId} itemText={itemContext.itemText} />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <FeedbackProvider>
        <AppContent />
      </FeedbackProvider>
    </BrowserRouter>
  )
}
