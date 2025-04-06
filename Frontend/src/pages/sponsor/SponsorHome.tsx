import { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import SponsorDescription from "../../components/sponsor/SponsorDescription";
import SponsorOption from "../../components/sponsor/SponsorOption";

const SponsorHome = () => {
    const navLinks = [
       
        { name: "Log Out", href: "/login" },
      ];

    const [sponsorProfileUrl] = useState("https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg");
    const [sponsorName] = useState("Google");
    const [sponsorObjective] = useState("We are looking for vibe coders.");
    const [sponsorDescription] = useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec blandit dapibus dolor, id malesuada sapien lacinia non. Aliquam eget mattis tellus. Praesent in elit et velit fringilla feugiat. Donec mauris velit, finibus quis quam vel, rhoncus eleifend odio. Integer a pharetra sem. Duis aliquam felis nec nulla porttitor luctus. Phasellus sed euismod enim, sit amet dignissim nibh. Nulla tempor, felis non consequat imperdiet, nunc metus interdum odio, eget placerat ipsum velit a tortor. Nulla imperdiet mi eu condimentum pharetra. Fusce quam libero, pharetra nec enim nec, ultrices scelerisque est.");

    const [sponserOptions] = useState([
        { header: "Edit Profile", description: "Edit your profile information.", buttonText: "Edit", onClick: () => console.log("Edit Profile") },
        { header: "View Applications", description: "View applications from members.", buttonText: "View", onClick: () => console.log("View Applications") },
        { header: "Post Event", description: "Post an event for members to see.", buttonText: "Post", onClick: () => console.log("Post Event") },
    ]);

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
                    <div className="py-24 px-16 md:px-32 flex-grow flex flex-col md:grid md:grid-cols-2 items-center gap-24">
                        <div className="flex flex-col items-center justify-center h-full gap-8">
                            <div className="w-full">   
                                <h1 className="text-4xl font-bold font-arial">
                                    Welcome back, <span className="text-bapred">{sponsorName}</span>!
                                </h1>
                            </div>
                            <SponsorDescription 
                                profileUrl={sponsorProfileUrl} 
                                name={sponsorName} 
                                objective={sponsorObjective} 
                                description={sponsorDescription} 
                            />
                        </div>
                        {/* Add another column with h-full to balance grid */}
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

export default SponsorHome;
