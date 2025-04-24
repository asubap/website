import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GoogleLogin from "../../components/auth/GoogleLogin";
import SponsorAuth from "../../components/auth/SponsorAuth";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import BAPLogo from "../../assets/BAP_Logo.png";
import { useAuth } from "../../context/auth/authProvider";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const LogInPage = () => {
    const { session, loading } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        // If already logged in, redirect to home or saved page
        if (session && !loading) {
            const savedPath = localStorage.getItem('redirectAfterLogin');
            if (savedPath) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(savedPath);
            } else {
                navigate('/auth/Home');
            }
        }
    }, [session, loading, navigate]);
    
    const navLinks = [
        { name: "About Us", href: "/about" },
        { name: "Our Sponsors", href: "/sponsors" },
        { name: "Events", href: "/events" },
        { name: "Membership", href: "/membership" },
    ];

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
            {/* Add padding-top to account for fixed navbar */}
            <div className="flex flex-col flex-grow pt-[72px]">
                <Navbar
                    isLogged={false}
                    links={navLinks}
                    title="Beta Alpha Psi | Beta Tau Chapter"
                    backgroundColor="#FFFFFF"
                    outlineColor="#AF272F"
                />
                <main className="flex-grow flex flex-col items-center justify-center h-full">
                    <div className="flex flex-col md:grid md:grid-cols-[auto_min-content_auto] items-center gap-8 h-full">
                        <div className="flex flex-col items-center gap-6 p-8">
                            <h1 className="text-4xl font-bold font-outfit">Welcome Back<span className="text-bapred">.</span></h1>
                            <GoogleLogin />
                            <SponsorAuth />
                        </div>

                        {/* vertical divider */}
                        <div className="hidden md:flex justify-center items-center h-full px-16">
                            <div className="w-[3px] bg-bapred h-2/3"></div> 
                        </div>

                        
                        {/* horizontal divider */}
                        <div className="flex justify-center w-full py-1 md:hidden">
                            <div className="h-[3px] w-[200px] bg-bapred"></div>
                        </div>

                        {/* BAP Logo */}
                        <div className="flex justify-center md:justify-start">
                            <img src={BAPLogo} alt="BAP Logo" className="w-48 md:w-auto"/>
                        </div>
                    </div>
                </main>

                <Footer backgroundColor="#AF272F" />
            </div>
        </div>
    )
}

export default LogInPage;
