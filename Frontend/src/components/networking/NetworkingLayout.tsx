import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { useAuth } from "../../context/auth/authProvider";

interface NetworkingLayoutProps {
  children: React.ReactNode;
}

const NetworkingLayout = ({ children }: NetworkingLayoutProps) => {
  const { session } = useAuth();

  // Define the navigation links for the navbar
  const navLinks = [
    { name: "Home", href: "/auth/Home" },
    { name: "Events", href: "/events" },
    { name: "Network", href: "/networking" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        links={navLinks}
        title="Beta Alpha Psi | Beta Tau Chapter"
        isLogged={!!session}
        outlineColor="#AF272F"
      />

      <main className="flex-1 bg-gray-50 mt-20">{children}</main>

      <Footer backgroundColor="#FFFFFF" />
    </div>
  );
};

export default NetworkingLayout;
