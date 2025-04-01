import "./App.css";
import { ProcessFlow } from "./pages/membership/ProcessFlow";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage/HomePage";
import LogInPage from "./pages/login/LoginPage";
import AuthHome from "./pages/homepage/AuthHome";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth, AuthProvider } from "./context/auth/authProvider";

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
            <Route path="/login" element={<LogInPage/>} />
            <Route path="/membership" element={<ProcessFlow />} />
            <Route path="/" element={<Homepage />} />
            <Route element = {<ProtectedRoute/>}>
              <Route path="/auth/Home" element={<AuthHome />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
