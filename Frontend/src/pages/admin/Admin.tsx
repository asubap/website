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

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    }

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
                <main className="flex-grow flex flex-col items-center justify-center h-full w-full">
                    <h1 className="text-4xl font-bold font-arial text-left w-full px-32">Admin Dashboard</h1>
                    <div className="grid grid-cols-2 gap-6 w-full px-32">
                        <div className="">
                            <div className="flex items-center">
                                <h2 className="text-2xl font-semibold">Events</h2>
                                <button className="ml-auto px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors">+ New Event</button>
                            </div>
                            <div>
                                place for event cards
                            </div>
                        </div>

                        <div className="">
                            <h2 className="text-2xl font-semibold">Admin Users</h2>
                            <form className="flex gap-4 items-center" onSubmit={handleAdminSubmit}>
                                <input 
                                    type="text" 
                                    placeholder="Enter admin email.." 
                                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bapred"
                                />
                                <button className="h-full px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors">
                                    + Add Admin
                                </button>
                            </form>

                        </div>
                        
                        <div className="">
                            <div className="flex items-center">
                                <h2 className="text-2xl font-semibold">Past Events</h2>
                            </div>
                            <div>
                                place for past event cards
                            </div>
                        </div>
                        
                        
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
                            <p className="text-gray-600">View website statistics and metrics</p>
                        </div>
                    </div>
                </main>


                
                <Footer backgroundColor="#AF272F" />
            </div>
        </div>
    )
}

export default Admin;