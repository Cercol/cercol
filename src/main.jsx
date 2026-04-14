import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'mm-design/tokens/colors.css'
import 'mm-design/tokens/typography.css'
import 'mm-design/tokens/spacing.css'
import './i18n'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
