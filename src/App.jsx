 import AuthPage from "./Components/AuthPage.jsx";

function App() {
  // Put your real login API here. Throw new Error("message") to show it on the card.
  const handleLogin = async (data) => {
    console.log("Login:", data); // { email, password, remember }
  };

  const handleSignup = async (data) => {
    console.log("Signup:", data); // { name, email, password, confirm }
  };

  // Runs after the success animation (~5s). Navigate to your dashboard here.
  const handleAuthSuccess = () => {
    console.log("Go to dashboard");
  };

  return (
    <AuthPage
      onLogin={handleLogin}
      onSignup={handleSignup}
      onAuthSuccess={handleAuthSuccess}
    />
  );
}

export default App;