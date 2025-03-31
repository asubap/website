
import Footer from "../../components/layout/Footer";

import { useEffect, useState } from "react";
import { supabase } from "../../context/auth/supabaseClient";

export default function AuthHome() {
    
    const [userDetails, setUserDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Define navigation links to pass to Navbar
  
    
    useEffect(() => {
      async function getUserData() {
        try {
          setLoading(true);
          
          // Get the user session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // Get user details
            const { data: userData } = await supabase.auth.getUser();
            setUserDetails(userData.user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
      
      getUserData();
    }, []);

    const handleSignOut = async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
    };

    return (
      <div className="flex flex-col min-h-screen">
        <div className="pt-24">
         
          <main className="flex-grow p-6">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
            
            {loading ? (
              <p>Loading user information...</p>
            ) : !userDetails ? (
              <p>No user information found. Please log in.</p>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="mb-2"><strong>Email:</strong> {userDetails.email}</p>
                <p className="mb-2"><strong>Name:</strong> {userDetails.user_metadata?.full_name || "Not provided"}</p>
                <p className="mb-2"><strong>User ID:</strong> {userDetails.id}</p>
                
                {/* Display additional user details */}
                <div className="mt-4">
                  <h2 className="text-xl font-semibold mb-2">Additional Information</h2>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto max-w-full">
                    {JSON.stringify(userDetails, null, 2)}
                  </pre>
                </div>
                
                <button 
                  onClick={handleSignOut}
                  className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </main>
          <Footer backgroundColor="#AF272F" />
        </div>
      </div>
    );
}