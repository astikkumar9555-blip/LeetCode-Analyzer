//  import AuthPage from "./Components/AuthPage.jsx";

// function App() {
//   // Put your real login API here. Throw new Error("message") to show it on the card.
//   const handleLogin = async (data) => {
//     console.log("Login:", data); // { email, password, remember }
//   };

//   const handleSignup = async (data) => {
//     console.log("Signup:", data); // { name, email, password, confirm }
//   };

//   // Runs after the success animation (~5s). Navigate to your dashboard here.
//   const handleAuthSuccess = () => {
//     console.log("Go to dashboard");
//   };

//   return (
//     <AuthPage
//       onLogin={handleLogin}
//       onSignup={handleSignup}
//       onAuthSuccess={handleAuthSuccess}
//     />
//   );
// }

// export default App;


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Dashboard from "./Dashboard/Dashboard";
import { getCurrentUser } from "./Components/auth";
import "./App.css";

function ProtectedRoute({ children }) {
  return getCurrentUser() ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  return getCurrentUser() ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}