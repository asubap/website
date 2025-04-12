
import { supabase } from "../../context/auth/supabaseClient";

const GoogleLogin = () => {
    
    
    // const redirectTo = () => {
    //     let rolePage = "";
    //     if (role === "e-board") {
    //         rolePage = "admin";
    //       }
    //       else if (role === "sponsor") {
    //         rolePage = "sponsor";
    //       }
    //       else if (role === "general-member") {
    //         rolePage = "member";
    //       }
    //       else {
    //         console.log("Invalid role");
    //       }

    //     const url = `http://localhost:5173/${rolePage}`;
    //     console.log(url);
    //     return url;
    // }
    const redirectTo = import.meta.env.VITE_ENV_STATE === "development" ? "http://localhost:5173/auth/Home" : "https://frontend-iota-gules-58.vercel.app/auth/Home";
    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {redirectTo: redirectTo}
            });
            
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in with Google:', error);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-4xl font-bold font-outfit">Welcome Back<span className="text-bapred">.</span></h1>
            <button onClick={handleGoogleLogin} className="p-4 md:p-6 rounded-lg text-l md:text-xl flex items-center justify-center gap-4 bg-white text-black hover:bg-gray-100 transition-colors">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-6 h-6 md:w-8 md:h-8" />
                Continue with Google
            </button>
        </div>
    )
}

export default GoogleLogin;
