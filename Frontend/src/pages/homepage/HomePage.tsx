import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function Homepage() {
  // Define navigation links to pass to Navbar
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
      <div className="pt-24">
        <Navbar
          links={navLinks}
          title="Beta Alpha Psi | Beta Tau Chapter"
          backgroundColor="#FFFFFF"
          outlineColor="#AF272F"
        />
        <main className="flex-grow">
          {/* Your homepage content goes here */}
        </main>
        <Footer backgroundColor="#AF272F" />
      </div>
    </div>
  );
}