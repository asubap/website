import Footer from "../../components/layout/Footer";
import { supabase } from "../../context/auth/supabaseClient";
import { useAuth } from "../../context/auth/authProvider";

export default function AuthHome() {    
    const { session } = useAuth();
    const user = session?.user;
    const { roles } = useAuth(); // Call hooks at the top level
    
    // Define navigation links to pass to Navbar
    const getRoles = async () => {
      console.log("User roles:", roles);
    }

    const handleSignOut = async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
    };

    return (
      <div className="flex flex-col min-h-screen">
        <div className="pt-24">
         
          <main className="flex-grow p-6">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
            
            {!user ? (
              <p>No user information found. Please log in.</p>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="mb-2"><strong>Email:</strong> {user.email}</p>
                <p className="mb-2"><strong>Name:</strong> {user.user_metadata?.full_name || "Not provided"}</p>
                <p className="mb-2"><strong>User ID:</strong> {user.id}</p>
                
                {/* Display additional user details */}
                <div className="mt-4">
                  <h2 className="text-xl font-semibold mb-2">Additional Information</h2>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto max-w-full">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
                
                <button 
                  onClick={handleSignOut}
                  className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
                <button 
                onClick={getRoles}
                  className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    Get Roles
                </button>
              </div>
            )}
          </main>
          <Footer backgroundColor="#AF272F" />
        </div>
      </div>
    );
}