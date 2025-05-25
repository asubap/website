import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { useAuth } from "../../context/auth/authProvider";

interface NetworkingLayoutProps {
  children: React.ReactNode;
  navLinks: { name: string; href: string }[];
}

const NetworkingLayout = ({ children, navLinks }: NetworkingLayoutProps) => {
  const { session, role } = useAuth();

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
