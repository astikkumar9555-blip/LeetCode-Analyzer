 import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthPage from './Components/AuthPage.jsx'
import Dashboard from './Dashboard/Dashboard.jsx'
import { getSession } from './Components/auth.js'

// Only logged-in users can open the dashboard.
function Protected({ children }) {
  return getSession() ? children : <Navigate to="/auth" replace />
}

// Logged-in users do not need the login page again.
function GuestOnly({ children }) {
  return getSession() ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/auth"
        element={
          <GuestOnly>
            <AuthPage />
          </GuestOnly>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}