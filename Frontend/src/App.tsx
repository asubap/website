import "./App.css";
import { ProcessFlow } from "./pages/membership/ProcessFlow";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage/HomePage";
import EventsPage from "./pages/events/EventsPage";
import LogInPage from "./pages/login/LogInPage";
import AuthHome from "./pages/homepage/AuthHome";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import { AuthProvider } from "./context/auth/authProvider";
import AboutPage from "./pages/about/AboutPage";
import SponsorsPage from "./pages/sponsors/SponsorsPage";
import SponsorHome from "./pages/sponsor/SponsorHome";
import Admin from "./pages/admin/Admin";
import MemberView from "./pages/member/MemberView";
import NetworkingPage from "./pages/network/NetworkingPage";
import NotFound from "./pages/notfound/NotFound";
import ViewEvent from "./pages/events/ViewEvent";
import { useState, createContext, useContext } from "react";
import Toast from "./components/ui/Toast";

// Define toast context
interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function App() {
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    duration: number;
  } | null>(null);

  const showToast = (
    message: string, 
    type: 'success' | 'error' | 'info' = 'success',
    duration: number = 3000
  ) => {
    setToast({ visible: true, message, type, duration });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <>
      <AuthProvider>
        <ToastContext.Provider value={{ showToast }}>
          <Router>
            <div className="font-outfit">
              <Routes>
                <Route path="/login" element={<LogInPage />} />
                <Route path="/membership" element={<ProcessFlow />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/sponsors" element={<SponsorsPage />} />
                <Route path="/" element={<Homepage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/auth/Home" element={<AuthHome />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/sponsor" element={<SponsorHome />} />
                  <Route path="/member" element={<MemberView />} />
                  <Route path="/network" element={<NetworkingPage />} />
                  <Route path="/events/:eventId" element={<ViewEvent />} />
                </Route>

                {/* 404 catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            {toast && toast.visible && (
              <Toast
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                onClose={hideToast}
              />
            )}
          </Router>
        </ToastContext.Provider>
      </AuthProvider>
    </>
  );
}

export default App;
