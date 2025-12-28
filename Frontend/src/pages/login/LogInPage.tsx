import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GoogleLogin from "../../components/auth/GoogleLogin";
import SponsorAuth from "../../components/auth/SponsorAuth";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import BAPLogo from "../../assets/BAP_Logo.png";
import { useAuth } from "../../context/auth/authProvider";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getNavLinks } from "../../components/nav/NavLink";

const LogInPage = () => {
  const { session, loading, setAuthError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Check for OAuth errors in URL (both query params and hash)
  useEffect(() => {
    let error = searchParams.get("error");
    let errorCode = searchParams.get("error_code");
    let errorDescription = searchParams.get("error_description");

    // Also check hash fragment for errors (OAuth sometimes puts them there)
    if (!error) {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      error = hashParams.get("error");
      errorCode = hashParams.get("error_code");
      errorDescription = hashParams.get("error_description");
    }

    if (error) {
      console.log("🔴 OAuth Error:", error, errorCode, errorDescription);

      // For banned users, redirect to auth/Home to show the unauthorized message
      if (errorCode === "user_banned") {
        setAuthError("Your account has been suspended. Please contact an administrator for assistance.");
        navigate("/auth/Home", { replace: true });
      } else {
        // For other errors, show them on the login page
        setOauthError(errorDescription || "Authentication failed. Please try again.");
      }
    }
  }, [searchParams, navigate, setAuthError]);

  useEffect(() => {
    // If already logged in, redirect to home or saved page
    if (session && !loading) {
      const savedPath = localStorage.getItem("redirectAfterLogin");
      if (savedPath) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(savedPath);
      } else {
        navigate("/auth/Home");
      }
    }
  }, [session, loading, navigate]);

  // If still loading, show loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner text="Loading..." size="lg" />
      </div>
    );
  }

  // If already logged in, the useEffect will handle redirection
  // This prevents flashing of the login page
  if (session) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Remove padding-top from here */}
      <div className="flex flex-col flex-grow">
        <Navbar
          isLogged={false}
          links={getNavLinks(!!session)}
          title="Beta Alpha Psi | Beta Tau Chapter"
          backgroundColor="#FFFFFF"
          outlineColor="#AF272F"
        />
        {/* Add padding-top directly to main content, increased value */}
        {/* Add horizontal padding to match navbar */}
        <main className="flex-grow flex flex-col items-center justify-center h-full p-8 pt-32 px-8 sm:px-16 lg:px-24">
          <div className="flex flex-col md:grid md:grid-cols-[auto_min-content_auto] items-center gap-4 md:gap-8 h-full">
            <div className="flex flex-col items-center gap-6 p-8">
              <h1 className="text-3xl sm:text-3xl md:text-4xl font-bold font-outfit">
                Welcome Back<span className="text-bapred">.</span>
              </h1>

              {/* Show OAuth error if present */}
              {oauthError && (
                <div className="w-full max-w-md p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <h2 className="text-lg font-semibold text-red-800 mb-2">
                    Authentication Error
                  </h2>
                  <p className="text-sm text-red-700 mb-3">
                    {oauthError}
                  </p>
                  <p className="text-xs text-red-600">
                    If this error persists, please contact your administrator.
                  </p>
                  <button
                    onClick={() => {
                      setOauthError(null);
                      navigate("/login", { replace: true });
                    }}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <GoogleLogin />
              <SponsorAuth />
            </div>

            {/* vertical divider */}
            <div className="hidden md:flex justify-center items-center h-full px-16">
              <div className="w-[3px] bg-bapred h-2/3"></div>
            </div>

            {/* BAP Logo - Hide on small screens (below md) */}
            <div className="hidden md:flex justify-center md:justify-start">
              <img src={BAPLogo} alt="BAP Logo" className="w-48 md:w-auto" />
            </div>
          </div>
        </main>

        <Footer backgroundColor="#AF272F" />
      </div>
    </div>
  );
};

export default LogInPage;
