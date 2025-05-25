import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useToast } from "../../context/toast/ToastContext";
import { useAuth } from "../../context/auth/authProvider";
import { navLinks } from "../../components/nav/NavLink";

import President from "../../assets/eboard-faculty/president.jpg";
import VicePresident from "../../assets/eboard-faculty/vice_president.jpg";
import Treasurer from "../../assets/eboard-faculty/treasurer.jpg";
import DirectorOfExternalReporting from "../../assets/eboard-faculty/director_external_reporting.jpg";
import DirectorOfInternalCommunications from "../../assets/eboard-faculty/director_internal_comms.jpg";
import DirectorOfProfessionalDevelopment from "../../assets/eboard-faculty/director_professional_dev.png";
import DirectorOfSocialEvents from "../../assets/eboard-faculty/director_social_events.jpg";
import DirectorOfCommunityService from "../../assets/eboard-faculty/director_community_service.jpg";
import DirectorOfMarketing from "../../assets/eboard-faculty/director_marketing.jpg";
import PledgeClassDirector from "../../assets/eboard-faculty/pledge_class_director.jpg";
import FacultyAdvisor from "../../assets/eboard-faculty/faculty_advisor.jpg";



type EboardFacultyEntry = {
  image: string;
  name: string;
  role: string;
  email: string;
  major: string; // Assuming 'major' can also store 'Accountancy & Business Law '25' or 'Faculty Advisor' details
  location: string;
};


const EboardFacultyPage: React.FC = () => {
  const { session, role } = useAuth();
  const { showToast } = useToast();

  const eboardFacultyEntries: EboardFacultyEntry[] = [
    {
      image: President, // Default placeholder image
      name: "Ernesto Flores",
      role: "President",
      email: "president.asubap@gmail.com",
      major: "Accountancy & Business Law '25",
      location: "Mesa, Arizona",
    },
    {
      image: VicePresident,
      name: "Pranjal Setia",
      role: "Vice President",
      email: "vp.asubap@gmail.com",
      major: "Accountancy & CIS '26",
      location: "Punjab, India",
    },
    {
      image: Treasurer,
      name: "Miguel Rodriguez",
      role: "Treasurer",
      email: "treasurer.asubap@gmail.com",
      major: "Accountancy '27",
      location: "Mexico City, Mexico",
    },
    {
      image: DirectorOfExternalReporting,
      name: "Faith Wang",
      role: "Director of External Reporting",
      email: "extrep.asubap@gmail.com", // Assuming email based on pattern, screenshot shows 'netrep.asubap@gmail.com'
      major: "Accountancy & CIS '26",
      location: "San Jose, California",
    },
    {
      image: FacultyAdvisor,
      name: "Carol Liu",
      role: "Faculty Advisor",
      email: "carol.liu@asu.edu",
      major: "PhD, MSA, MBA, BBA", // Using major to store qualifications as per screenshot
      location: "Tempe, Arizona", // Location not specified, assuming Tempe based on ASU
    },
    {
      image: DirectorOfInternalCommunications,
      name: "Bryce Bateman",
      role: "Director of Internal Comm.",
      email: "office.asubap@gmail.com",
      major: "Finance '25",
      location: "Mesa, Arizona",
    },
    {
      image: DirectorOfSocialEvents,
      name: "Lily Reid",
      role: "Director of Social Events",
      email: "socials.asubap@gmail.com",
      major: "Accountancy '27",
      location: "Phoenix, Arizona",
    },
    {
      image: DirectorOfProfessionalDevelopment,
      name: "Jai Mahant",
      role: "Director of Professional Dev.",
      email: "pd.asubap@gmail.com",
      major: "Accountancy & BDA '27",
      location: "Toronto, Canada",
    },
    {
      image: PledgeClassDirector,
      name: "Reid Schwan",
      role: "Pledge Class Director",
      email: "pledgeclass.asubap@gmail.com",
      major: "Accountancy '26",
      location: "Mesa, Arizona",
    },
    {
      image: DirectorOfCommunityService,
      name: "Victoria Prowell",
      role: "Director of Community Service",
      email: "dcs.asubap@gmail.com",
      major: "Accountancy '26",
      location: "Las Vegas, Nevada",
    },
    {
      image: DirectorOfMarketing,
      name: "Samuel Hsu",
      role: "Director of Marketing",
      email: "info.asubap@gmail.com",
      major: "Accountancy & Finance '26",
      location: "Taipei, Taiwan",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        links={navLinks}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        isLogged={Boolean(session)}
        role={role}
      />
      <main className="flex-grow p-8 pt-32">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-left w-full mb-6">
            Spring 2025 Executive Board & Faculty
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {eboardFacultyEntries.map((entry, index) => (
              <div key={index} className="bg-white shadow-xl rounded-lg p-6 flex flex-col items-center text-center">
                <img
                  src={entry.image} // Placeholder image path
                  alt={`Photo of ${entry.name}`}
                  className="w-32 h-32 rounded-full object-cover mb-4"
                />
                <h2 className="text-xl font-semibold">{entry.name}</h2>
                <p className="text-bapred font-medium">{entry.role}</p>
                <p className="text-sm text-bapgray">{entry.major}</p>
                <p className="text-sm text-bapgray">{entry.location}</p>
                <button
                  type="button"
                  className="text-bapred hover:underline focus:outline-none text-sm"
                  title="Copy email to clipboard"
                  onClick={() => {
                    navigator.clipboard.writeText(entry.email);
                    showToast("Email copied to clipboard!", "success");
                  }}
                >
                  {entry.email}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer backgroundColor="#AF272F" />
    </div>
  );
};

export default EboardFacultyPage;