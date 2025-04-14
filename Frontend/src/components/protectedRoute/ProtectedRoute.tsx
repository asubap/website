import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth/authProvider";

const ProtectedRoute = () => {
  const { session, loading, role } = useAuth();
  const location = useLocation();

  // Function to check if user has permission for current route
  const hasPermission = () => {
    if (!role) return false;
    
    const path = location.pathname;
    
    // Check route against role permissions
    if (path.startsWith("/admin") && !role.includes("e-board")) {
      return false;
    }
    if (path.startsWith("/sponsor") && !role.includes("sponsor")) {
      return false;
    }

    if (path.startsWith("/member") && !role.includes("general-member")) {
      return false;
    }
    // Add more route permission checks as needed

    console.log("User has permission for this route");
    
    return true;
  };

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-bapred"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!session) {
    // Save the attempted URL for redirecting back after login
    console.log("Redirecting to login");
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" />;
  }

  // If user doesn't have permission for this route
  if (!hasPermission()) {
    return <Navigate to="/auth/Home" />;
  }
  
  // User is authenticated and has permission
  return <Outlet />;
};

export default ProtectedRoute;