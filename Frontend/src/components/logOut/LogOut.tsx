import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../context/auth/supabaseClient";
import { useAuth } from "../../context/auth/authProvider";

const LogOut = () => {
    const navigate = useNavigate();
    const { setSession } = useAuth();
    
    const handleSignOut = async () => {
        try {
            // Sign out from Supabase
            await supabase.auth.signOut();
            
            // Clear session in context
            setSession(null);
            
            // Navigate to home page using React Router
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Error during sign out:", error);
        }
    };
    
    return (
        <>
            <Link
                key="Log Out"
                to="/"
                onClick={handleSignOut}
                className="hover:text-bapred text-xl font-medium"  
            >
                Log Out
            </Link>
        </>
    )
};

export default LogOut;