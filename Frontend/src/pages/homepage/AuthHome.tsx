import { supabase } from "../../context/auth/supabaseClient";
import { useAuth } from "../../context/auth/authProvider";

import Admin from "../admin/Admin";
import SponsorHome from "../sponsor/SponsorHome";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import { useNavigate } from "react-router-dom";
export default function AuthHome() {    
    const { session } = useAuth();
    const user = session?.user;
    const { role } = useAuth(); // Call hooks at the top level
    console.log(role)
    const navigate = useNavigate();

    
    const handleSignOut = async () => {
      console.log(role);
      await supabase.auth.signOut();
      window.location.href = "/";
    };

    const handleRoleClick = (role: String) => { 
      console.log(role);
      if (role === "e-board") {
        navigate("/admin");
      }
      else if (role === "sponsor") {
        navigate("/sponsor");
      }
      else if (role === "general-member") {
        console.log("General member");
      }
      else {
        console.log("Invalid role");
      }
      
     
    };

    return (
      <>
        {/* {role === "e-board" ? (
          <Admin />
        ) : role === "sponsor" ? (
          <SponsorHome />
        ) : ( */}
          <div>
            <h1 className="text-3xl font-bold text-center">Welcome, {user?.email}!</h1>
            <p className="text-center">You are logged in as a member. Role: {role ? role.map((item: string | any, i : number) => 
            <button 
              key = {i}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => handleRoleClick(item)}
            >
              {item}
            </button>) : ''}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        
      </>
    );
}