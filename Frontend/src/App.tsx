import "./App.css";
import { ProcessFlow } from "./pages/membership/ProcessFlow";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage/HomePage";
import LogInPage from "./pages/login/LoginPage";
import { AuthProvider } from "./context/auth/authProvider";
import AuthHome from "./pages/homepage/AuthHome";
import { useAuth } from "./context/auth/authProvider";
import { Navigate, Outlet } from "react-router-dom";
function App() {
  // Protected route example
  const ProtectedRoute = () => {
    const {loading} = useAuth();
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
        </Routes>
      </Router>
    </AuthProvider>
    </>
  );
}

export default App;
