import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { useAuth } from "../../context/auth/authProvider";

interface NetworkingLayoutProps {
  children: React.ReactNode;
  navLinks: { name: string; href: string }[];
}

const NetworkingLayout = ({ children, navLinks }: NetworkingLayoutProps) => {
  const { role, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        links={navLinks}
        title="Beta Alpha Psi | Beta Tau Chapter"
        isLogged={isAuthenticated}
        outlineColor="#AF272F"
        role={role}
      />

      <main className="flex-1 bg-gray-50 p-8 pt-32 px-8 sm:px-16 lg:px-24">
        {children}
      </main>

      <Footer backgroundColor="#FFFFFF" />
    </div>
  );
};

export default NetworkingLayout;
