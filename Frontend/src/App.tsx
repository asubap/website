import "./App.css";
import { ProcessFlow } from "./pages/membership/ProcessFlow";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage/HomePage";
import LogInPage from "./pages/login/LogInPage";
import AuthHome from "./pages/homepage/AuthHome";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import { AuthProvider } from "./context/auth/authProvider";
import AboutPage from "./pages/about/AboutPage";
import SponsorsPage from "./pages/sponsors/SponsorsPage";

import SponsorHome from "./pages/sponsor/SponsorHome";
import SponsorEdit from "./pages/sponsor/SponsorEdit";
import Admin from "./pages/admin/Admin";
import CreateEvent from "./pages/admin/CreateEvent";

import MemberView from "./pages/member/MemberView";
import NetworkingPage from "./pages/networking/NetworkingPage";

function App() {
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

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/auth/Home" element={<AuthHome />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/sponsor" element={<SponsorHome />} />
              <Route path="/member" element={<MemberView />} />
              <Route path="/sponsor/edit" element={<SponsorEdit />} />
              <Route path="/admin/create-event" element={<CreateEvent />} />
              <Route path="/networking" element={<NetworkingPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
