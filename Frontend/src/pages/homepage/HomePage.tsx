import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Hero from "../../components/Hero/Hero";
import WhoWeAre from "../../components/Hero/WhoWeAre";
import { useAuth } from "../../context/auth/authProvider";

export default function Homepage() {
  const { session } = useAuth();

  // Define navigation links to pass to Navbar
  const navLinks = [
    { name: "About Us", href: "/about" },
    { name: "Our Sponsors", href: "/sponsors" },
    { name: "Events", href: "/events" },
    { name: "Membership", href: "/membership" },
  ];
  
  // Add login link only if user is not logged in
  if (!session) {
    navLinks.push({ name: "Log In", href: "/login" });
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Add padding-top to account for fixed navbar */}
      <div>
        <Navbar
          links={navLinks}
          isLogged={!!session}
          title="Beta Alpha Psi | Beta Tau Chapter"
          backgroundColor="#FFFFFF"
          outlineColor="#AF272F"
        />
        <main className="flex-grow">
          <Hero />
          <WhoWeAre />
        </main>
        <Footer backgroundColor="#AF272F" />
      </div>
    </div>
  );
}
