import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useToast } from "../../context/toast/ToastContext";
import { useAuth } from "../../context/auth/authProvider";
import { navLinks } from "../../components/nav/NavLink";

const socialIcons = {
  linkedin: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  instagram: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
};

const staticSocialLinks = [
  {
    name: "linkedin",
    href: "https://www.linkedin.com/company/bap-betatauchapter/",
  },
  { name: "instagram", href: "https://www.instagram.com/bapbetatauchapter/" },
];

const ContactUsPage: React.FC = () => {
  const { session, role } = useAuth();
  const { showToast } = useToast();
  // showToast("Event created successfully", "success");

  const contactDetails = [
    { role: "President", email: "president.asubap@gmail.com" },
    { role: "Vice President", email: "vp.asubap@gmail.com" },
    { role: "Treasurer", email: "treasurer.asubap@gmail.com" },
    { role: "Internal Communications", email: "cmc.asubap@gmail.com" },
    { role: "Director of Recruiting", email: "info.asubap@gmail.com" },
    { role: "Director of External Reporting", email: "natl.ro.asubap@gmail.com" },
    { role: "Director of the Pledge Class", email: "pledgeclass.asubap@gmail.com" },
    { role: "Director of Social Events", email: "socials.asubap@gmail.com" },
    { role: "Director of Community Service", email: "dcs.asubap@gmail.com" },
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
          Contact Us
        </h1>

          <div className="bg-white shadow-xl rounded-lg p-8 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info Section */}
            <div className="md:col-span-2 space-y-5">
              {contactDetails.map((contact, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-200 lg:last:border-b-0">
                  <p className="text-lg font-semibold min-w-[250px]">{contact.role}:</p>
                  <button
                    type="button"
                    className="truncate text-bapred font-medium hover:underline focus:outline-none"
                    title="Copy email to clipboard"
                    onClick={() => {
                      navigator.clipboard.writeText(contact.email);
                      showToast("Email copied to clipboard!", "success");
                    }}
                  >
                    {contact.email}
                  </button>
                </div>
              ))}
            </div>

            {/* Social Media Section */}
            <div className="md:col-span-1 flex flex-col items-center justify-start space-y-6 pt-8 md:pt-0 md:pl-8 md:border-l md:border-gray-200">
              <a
                href={staticSocialLinks[0].href} // Replace with your actual Instagram link
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center w-32 h-32 bg-[#AF272F] text-white rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300 p-4"
              >
                {socialIcons.instagram}
                <span className="mt-2 text-lg font-medium">Instagram</span>
              </a>
              <a
                href={staticSocialLinks[1].href} // Replace with your actual LinkedIn link
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center w-32 h-32 bg-[#0077B5] text-white rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-300 p-4" // LinkedIn blue
              >
                {socialIcons.linkedin}
                <span className="mt-2 text-lg font-medium">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer backgroundColor="#AF272F" />
    </div>
  );
};

export default ContactUsPage;