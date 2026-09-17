import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LandingPage from './LandingPage.jsx'
import App from './App.jsx'

function Root() {
  const [showAssessment, setShowAssessment] = useState(false)

  const handleStartAssessment = () => {
    setShowAssessment(true)
    window.scrollTo(0, 0)
  }

  if (showAssessment) {
    return <App />
  }

  return <LandingPage onStartAssessment={handleStartAssessment} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
