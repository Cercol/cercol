import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FeedbackProvider, useFeedbackContext } from './context/FeedbackContext'
import HomePage from './pages/HomePage'
import RadarTestPage from './pages/RadarTestPage'
import RadarResultsPage from './pages/RadarResultsPage'
import TestPage from './pages/TestPage'
import ResultsPage from './pages/ResultsPage'
import FeedbackButton from './components/FeedbackButton'

function AppContent() {
  const { itemContext } = useFeedbackContext()
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/radar" element={<RadarTestPage />} />
        <Route path="/radar/results" element={<RadarResultsPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/results" element={<ResultsPage />} />
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
