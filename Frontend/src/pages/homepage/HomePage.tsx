import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Hero from "../../components/Hero/Hero";
import WhoWeAre from "../../components/Hero/WhoWeAre";
import { useAuth } from "../../context/auth/authProvider";
import { getNavLinks } from "../../components/nav/NavLink";


export default function Homepage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Add padding-top to account for fixed navbar */}
      <div>
        <Navbar
          links={getNavLinks(isAuthenticated)}
          isLogged={isAuthenticated}
          title="Beta Alpha Psi | Beta Tau Chapter"
          backgroundColor="#FFFFFF"
          outlineColor="#AF272F"
          role={role}
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
