import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FeedbackProvider, useFeedbackContext } from './context/FeedbackContext'
import HomePage from './pages/HomePage'
import NewMoonPage from './pages/NewMoonPage'
import NewMoonResultsPage from './pages/NewMoonResultsPage'
import FirstQuarterPage from './pages/FirstQuarterPage'
import FirstQuarterResultsPage from './pages/FirstQuarterResultsPage'
import FeedbackButton from './components/FeedbackButton'

function AppContent() {
  const { itemContext } = useFeedbackContext()
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* New Moon */}
        <Route path="/new-moon" element={<NewMoonPage />} />
        <Route path="/new-moon/results" element={<NewMoonResultsPage />} />
        {/* First Quarter */}
        <Route path="/first-quarter" element={<FirstQuarterPage />} />
        <Route path="/first-quarter/results" element={<FirstQuarterResultsPage />} />
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
