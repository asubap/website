import "./App.css";
import { ProcessFlow } from "./pages/membership/ProcessFlow";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage/HomePage";
import LogInPage from "./pages/login/LogInPage";
import AuthHome from "./pages/homepage/AuthHome";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth, AuthProvider } from "./context/auth/authProvider";
import AboutPage from "./pages/about/AboutPage";
import SponsorsPage from "./pages/sponsors/SponsorsPage";

import SponsorHome from "./pages/sponsor/SponsorHome";
import SponsorEdit from "./pages/sponsor/SponsorEdit";
import Admin from "./pages/admin/Admin";

function App() {
  // Protected route example
  const ProtectedRoute = () => {
    const session = useAuth();
    
    return session ? <Outlet/> : <Navigate to="/login" replace/>;
  }

  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LogInPage />} />
            <Route path="/membership" element={<ProcessFlow />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sponsors" element={<SponsorsPage />} />
            <Route path="/" element={<Homepage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/auth/Home" element={<AuthHome />} />
              <Route path="/admin" element={<Admin/>} />
              <Route path="/sponsor" element={<SponsorHome />} />
            </Route>
            {/* sponsor routes, not yet auth for testing purposes */}
            <Route path="/sponsor" element={<SponsorHome />} />
            <Route path="/sponsor/edit" element={<SponsorEdit />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
