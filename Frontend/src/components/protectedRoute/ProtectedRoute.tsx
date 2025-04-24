import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth/authProvider";
import LoadingSpinner from "../common/LoadingSpinner";

const ProtectedRoute = () => {
  const { session, loading, role } = useAuth();
  const location = useLocation();

  // Function to check if user has permission for current route
  const hasPermission = () => {
    if (!role) return false;

    const path = location.pathname;

    // Helper function to check role - handles both string and object formats
    const checkRole = (roleType: string) => {
      if (typeof role === "string") {
        return role.includes(roleType);
      } else if (typeof role === "object" && role !== null) {
        // If role is an object with a type property (new format)
        return role.type === roleType;
      }
      return false;
    };

    // Check route against role permissions
    if (path.startsWith("/admin") && !checkRole("e-board")) {
      return false;
    }
    if (path.startsWith("/sponsor") && !checkRole("sponsor")) {
      return false;
    }

    if (path.startsWith("/member") && !checkRole("general-member")) {
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
        <LoadingSpinner text="Loading..." size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!session) {
    // Save the attempted URL for redirecting back after login
    console.log("Redirecting to login");
    localStorage.setItem("redirectAfterLogin", location.pathname);
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
