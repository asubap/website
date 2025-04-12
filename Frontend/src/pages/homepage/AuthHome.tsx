
import { useAuth } from "../../context/auth/authProvider";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AuthHome() {    
    const { role } = useAuth(); // Call hooks at the top level
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { 
      console.log("Current role in AuthHome:", role);
      
      if (!role) {
        console.log("Role is not yet available, waiting...");
        return; // Exit early if role is not yet available
      }
      
      setIsLoading(false);
      
      if (role === "e-board") {
        console.log("Redirecting to admin page...");
        navigate("/admin");
      }
      else if (role === "sponsor") {
        console.log("Redirecting to sponsor page...");
        navigate("/sponsor");
      }
      else if (role === "general-member") {
        console.log("Redirecting to member page...");
        navigate("/member");
      }
      else {
        console.log("Invalid role:", role);
      }
    }, [role, navigate]);

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-xl">Loading your dashboard...</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        {role ? (
          <p className="text-xl">Redirecting you to the appropriate dashboard...</p>
        ) : (
          <p className="text-xl">Unable to determine your role. Please try logging in again.</p>
        )}
      </div>
    );
}
