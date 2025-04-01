import { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import SponsorOption from "../../components/sponsor/SponsorOption";

const SponsorEdit = () => {
    const navLinks = [
        { name: "About Us", href: "/about" },
        { name: "Our Sponsors", href: "/sponsors" },
        { name: "Events", href: "/events" },
        { name: "Membership", href: "/membership" },
        { name: "Log In", href: "/login" },
      ];

    const [sponserOptions, setSponsorOptions] = useState([
        { header: "Edit Profile", description: "Edit your profile information.", buttonText: "Edit", onClick: () => console.log("Edit Profile") },
        { header: "View Applications", description: "View applications from members.", buttonText: "View", onClick: () => console.log("View Applications") },
        { header: "Post Event", description: "Post an event for members to see.", buttonText: "Post", onClick: () => console.log("Post Event") },
    ]);

    const handleEditProfile = () => {
        // Handle edit profile logic here
        console.log("Edit Profile clicked");
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar
                    links={navLinks}
                    title="Beta Alpha Psi | Beta Tau Chapter"
                    backgroundColor="#FFFFFF"
                    outlineColor="#AF272F"
                />

            {/* Add padding-top to account for fixed navbar */}
            <div className="flex flex-col pt-[72px] flex-grow">
                <main className="flex-grow flex flex-col items-center justify-center">
                    <div className="w-full py-24 px-16 md:px-32 flex-grow flex flex-col md:grid md:grid-cols-2 items-center gap-24">
                        <div className="flex flex-col h-full gap-8">
                            <div className="w-full flex flex-col gap-8">   
                                <h1 className="text-4xl font-bold font-arial">Update Profile</h1>
                                <form className="w-full flex flex-col gap-4" onSubmit={handleEditProfile}>
                                    <input 
                                        type="text" 
                                        placeholder="Name" 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF272F]"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Hiring" 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF272F]"
                                    />
                                    <textarea 
                                        placeholder="Write about your company..." 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF272F] h-32"
                                    />
                                    <button 
                                        type="submit" 
                                        className="ml-auto bg-bapred text-white px-6 py-2 rounded-md hover:bg-bapreddark transition-colors"
                                    >
                                        Apply Changes
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="h-full w-full">
                            <div className="flex flex-col gap-12 h-full">
                                {sponserOptions.map((option, index) => (
                                    <SponsorOption 
                                        key={index} 
                                        header={option.header} 
                                        description={option.description} 
                                        buttonText={option.buttonText} 
                                        onClick={option.onClick} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            
            <Footer backgroundColor="#AF272F" />
        </div>
    )
}

export default SponsorEdit;