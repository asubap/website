import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const Admin = () => {
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
                    
                </main>


                
                <Footer backgroundColor="#AF272F" />
            </div>
        </div>
    )
}

export default Admin;