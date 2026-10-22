import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AuthPage from './Components/AuthPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthPage />
  </StrictMode>,
)
