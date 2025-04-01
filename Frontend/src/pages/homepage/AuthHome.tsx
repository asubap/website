import { supabase } from "../../context/auth/supabaseClient";
import { useAuth } from "../../context/auth/authProvider";

import Admin from "../admin/Admin";

export default function AuthHome() {    
    const { session } = useAuth();
    const user = session?.user;
    const { role } = useAuth(); // Call hooks at the top level

    const handleSignOut = async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
    };

    return (
      <>
        {role == "e-board" ? (
          <Admin></Admin>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-center">Welcome, {user?.email}!</h1>
            <p className="text-center">You are logged in as a member. {role ? role.toString() : ''}</p>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        )}
      </>
    );
}