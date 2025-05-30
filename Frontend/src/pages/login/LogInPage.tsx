import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GoogleLogin from "../../components/auth/GoogleLogin";
import SponsorAuth from "../../components/auth/SponsorAuth";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import BAPLogo from "../../assets/BAP_Logo.png";
import { useAuth } from "../../context/auth/authProvider";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getNavLinks } from "../../components/nav/NavLink";

const LogInPage = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

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
              <h1 className="text-4xl font-bold font-outfit">
                Welcome Back<span className="text-bapred">.</span>
              </h1>
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
