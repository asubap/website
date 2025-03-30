import "./App.css";
import { ProcessFlow } from "./pages/membership/ProcessFlow";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage/HomePage";
import LogInPage from "./pages/login/LogInPage";
import SponsorsPage from "./pages/sponsors/SponsorsPage";
import { AuthProvider } from "./context/auth/authProvider";
import AboutPage from "./pages/about/AboutPage";
function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LogInPage />} />
            <Route path="/membership" element={<ProcessFlow />} />
            <Route path="/sponsors" element={<SponsorsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/" element={<Homepage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
