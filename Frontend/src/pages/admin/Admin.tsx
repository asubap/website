import { useEffect, useState } from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import { supabase } from "../../context/auth/supabaseClient";

import EmailList from "../../components/admin/EmailList";
const Admin = () => {
    const navLinks = [
        { name: "About Us", href: "/about" },
        { name: "Our Sponsors", href: "/sponsors" },
        { name: "Events", href: "/events" },
        { name: "Membership", href: "/membership" },
        { name: "Log In", href: "/login" },
      ];

    const [adminEmails, setAdminEmails] = useState<string[]>([]);

    const [sponsorEmails, setSponsorEmails] = useState<string[]>([]);

    useEffect(() => {
        const fetchAdmins = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              // Fetch user role
              const token = session.access_token;
              fetch("https://asubap-backend.vercel.app/roles/e-board", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }).then((response) => response.json())
                .then((data) => {
                    const emails = data.map((item: any) => item.email);
                    setAdminEmails(emails);
                })
                .catch((error) => console.error("Error fetching role:", error));
            }
          };

          const fetchSponsors = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
              const token = session.access_token;
              fetch("https://asubap-backend.vercel.app/roles/sponsors", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }).then((response) => response.json())
                .then((data) => {
                    const emails = data.map((item: any) => item.email);
                    setSponsorEmails(emails);
                })
                .catch((error) => console.error("Error fetching role:", error));
            }
          };
      
          fetchAdmins();
      
          fetchSponsors();
          
    }, []);

    const handleAdminSubmit = (e: React.FormEvent) => {
        // TODO: Add admin email to the database
        e.preventDefault();
    }

    const handleSponsorSubmit = (e: React.FormEvent) => {
        // TODO: Add sponsor email to the database
        e.preventDefault();
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar
                    links={navLinks}
                    title="Beta Alpha Psi | Beta Tau Chapter"
                    backgroundColor="#FFFFFF"
                    outlineColor="#AF272F"
                />

            {/* Add padding-top to account for fixed navbar */}
            <div className="flex flex-col flex-grow pt-24">
                <main className="flex-grow flex flex-col items-center justify-center h-full w-full my-12">
                    <h1 className="text-4xl font-bold font-arial text-left w-full px-32 mb-6">Admin Dashboard</h1>
                    <div className="grid grid-cols-2 gap-12 w-full px-32">
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
                            <h2 className="text-2xl font-semibold mb-2">Admin Users</h2>
                            <form className="flex gap-4 justify-between items-center" onSubmit={handleAdminSubmit}>
                                <input 
                                    type="text" 
                                    placeholder="Enter admin email.." 
                                    className="w-3/4 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bapred"
                                />
                                <button className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors">
                                    + Add Admin
                                </button>
                            </form>
                            <EmailList emails={adminEmails} />
                        </div>
                        
                        <div className="">
                            <div className="flex items-center">
                                <h2 className="text-2xl font-semibold">Past Events</h2>
                            </div>
                            <div>
                                place for past event cards
                            </div>
                        </div>
                        
                        
                        
                        <div className="">
                            <h2 className="text-2xl font-semibold mb-2">Sponsors</h2>
                            <form className="flex gap-4 justify-between items-center" onSubmit={handleSponsorSubmit}>
                                <input 
                                    type="text" 
                                    placeholder="Enter sponsor email.." 
                                    className="w-3/4 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bapred"
                                />
                                <button className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors">
                                    + Add Sponsor
                                </button>
                            </form>
                            <EmailList emails={sponsorEmails} />
                        </div>
                    </div>
                </main>
            </div>

            <Footer backgroundColor="#AF272F" />
        </div>
    )
}

export default Admin;