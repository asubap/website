import GoogleLogin from "../../components/auth/GoogleLogin";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import BAPLogo from "../../assets/BAP_Logo.png";

const LogInPage = () => {
  const navLinks = [
    { name: "About Us", href: "/about" },
    { name: "Our Sponsors", href: "/sponsors" },
    { name: "Events", href: "/events" },
    { name: "Membership", href: "/membership" },
    { name: "Log In", href: "/login" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Add padding-top to account for fixed navbar */}
      <div className="flex flex-col flex-grow pt-24">
        <Navbar
          links={navLinks}
          title="Beta Alpha Psi | Beta Tau Chapter"
          backgroundColor="#FFFFFF"
          outlineColor="#AF272F"
        />
        <main className="flex-grow flex flex-col items-center justify-center h-full">
          <div className="flex flex-col md:grid md:grid-cols-[auto_min-content_auto] items-center gap-8 h-full">
            <div className="flex justify-center md:justify-end">
              <GoogleLogin />
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
