import { supabase } from "../../context/auth/supabaseClient";
import { useAuth } from "../../context/auth/authProvider";
import { useState } from "react";

const GoogleLogin = () => {
    const { user, setUser } = useAuth();

    const handleGoogleLogin = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            
            if (error) throw error;
            
            // Get the session after successful login
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                console.log(session.user);
            }
        } catch (error) {
            console.error('Error logging in with Google:', error);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-4xl font-bold font-arial">Welcome Back<span className="text-bapred">.</span></h1>
            <button onClick={handleGoogleLogin} className="p-4 md:p-6 rounded-lg text-l md:text-xl flex items-center justify-center gap-4 bg-white text-black hover:bg-gray-100 transition-colors">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-6 h-6 md:w-8 md:h-8" />
                Continue with Google
            </button>
        </div>
    )
}

export default GoogleLogin;




