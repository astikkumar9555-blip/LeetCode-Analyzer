import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AuthPage from './Components/Authpage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthPage />
  </StrictMode>,
)
