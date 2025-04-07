import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth/authProvider";

const ProtectedRoute = () => {
  const { session, loading, role } = useAuth();
  const location = useLocation();
  console.log(role);

  // Function to check if user has permission for current route
  const hasPermission = () => {
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
//   if(role.length > 1) {
//     return <Navigate to="/auth/Home" />;
//     // role.forEach((r) => {
//     //   if (r === "e-board") {
//     //     return <Navigate to="/admin" />;
//     //   }
//     //   if (r === "sponsor") {
//     //     return <Navigate to="/sponsor" />;
//     //   }
//     //   if (r === "member") {
//     //     return <Navigate to="/auth/Home" />;
//     //   }
//     // })
//   }
  
    
  if (!session) {
    return <Navigate to="/login" />;
  }

  if(hasPermission() === false) {
    return <Navigate to="/login"/>
  }
  return <Outlet />;
  
  
};

export default ProtectedRoute;