import { useCallback, useEffect } from "react";
import { supabase } from "../../context/auth/supabaseClient";
import { useAuth } from "../../context/auth/authProvider";

const GoogleLogin = () => {
  const { session } = useAuth();

  // Get base URL for redirect
  const baseUrl =
    import.meta.env.VITE_ENV_STATE === "development"
      ? "http://localhost:5173"
      : "https://frontend-iota-gules-58.vercel.app";

  // Redirect to saved path or default to auth home
  const getRedirectUrl = useCallback(() => {
    const savedPath = localStorage.getItem("redirectAfterLogin");
    // If there's a saved path, use it and clear storage
    if (savedPath) {
      localStorage.removeItem("redirectAfterLogin");
      return `${baseUrl}${savedPath}`;
    }
    // Otherwise default to auth home
    return `${baseUrl}/auth/Home`;
  }, [baseUrl]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getRedirectUrl(),
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  // If already logged in, redirect appropriately
  useEffect(() => {
    if (session) {
      window.location.href = getRedirectUrl();
    }
  }, [session, getRedirectUrl]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-outfit mb-4">Members</h1>
      <button
        onClick={handleGoogleLogin}
        className="p-2 md:p-4 rounded-lg text-xl flex items-center justify-center gap-4 bg-white text-black hover:bg-gray-100 transition-colors"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
          className="w-6 h-6 md:w-8 md:h-8"
        />
        Continue with Google
      </button>
    </div>
  );
};

export default GoogleLogin;
