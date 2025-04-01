import "./App.css";
import { ProcessFlow } from "./pages/membership/ProcessFlow";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage/HomePage";
import LogInPage from "./pages/login/LoginPage";
import { AuthProvider } from "./context/auth/authProvider";
import AuthHome from "./pages/homepage/AuthHome";
import { useAuth } from "./context/auth/authProvider";
import { Navigate, Outlet } from "react-router-dom";

import SponsorHome from "./pages/sponsor/SponsorHome";
import SponsorEdit from "./pages/sponsor/SponsorEdit";

function App() {
  // Protected route example
  const ProtectedRoute = () => {
    const {user, loading} = useAuth();
    if (loading) return <p>Loading...</p>;
    return user ? <Outlet/> : <Navigate to="/login" replace/>;
  }
  return (
    <>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LogInPage/>} />
          <Route path="/membership" element={<ProcessFlow />} />
          <Route path="/" element={<Homepage />} />
          <Route element = {<ProtectedRoute/>}>
            <Route path="/auth/Home" element={<AuthHome />} />
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
