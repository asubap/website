import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { useAuth } from "../../context/auth/authProvider";

interface NetworkingLayoutProps {
  children: React.ReactNode;
}

const NetworkingLayout = ({ children }: NetworkingLayoutProps) => {
  const { session, role } = useAuth();
  
  // Define the navigation links for authenticated users in the networking section
  const navLinks = [
    { name: "Network", href: "/network" },
    { name: "Events", href: "/events" },
    { name: "Dashboard", href: "/admin" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        links={navLinks}
        title="Beta Alpha Psi | Beta Tau Chapter"
        isLogged={!!session}
        outlineColor="#AF272F"
        role={role}
      />

      <main className="flex-1 bg-gray-50 mt-20">{children}</main>

      <Footer backgroundColor="#FFFFFF" />
    </div>
  );
};

export default NetworkingLayout;
