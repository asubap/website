import React from "react";
import { ProcessStep } from "../../components/ui/ProcessStep";
import { ProcessArrow } from "../../components/ui/ProcessArrow";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/auth/authProvider";
import { getNavLinks } from "../../components/nav/NavLink";

export const ProcessFlow = () => {
  const { session } = useAuth();
  const navLinks = getNavLinks(!!session);
  
  const steps = [
    {
      title: "W.P. Carey Student",
      requirements: [
        "Declare or plan to declare major in Accounting, Finance, Business Data Analytics, or Computer Information Systems.",
        "Complete BAP application during the recruiting window at the beginning of the Fall or Spring semester.",
      ],
    },
    {
      title: "Candidate",
      requirements: [
        "Must complete the 32 service and professional hours requirement (at least 12 professional hours, at least 12 service hours, at least 4 social hours and 4 professional development hours) with 16 hours commonly done in one semester.",
        "You can complete up to 5 non-BAP professional hours and 5 non-BAP community service hours, as long as you provide documentation.",
        "Pay the Candidate fee.",
        "Complete first upper-division major course (i.e., ACC 340, FIN 302, CIS 340)*.",
        "Maintain at least a 3.0 major and overall GPA.",
      ],
    },
    {
      title: "Member",
      requirements: [
        "Membership is achieved once 32 hours are completed and the GPA requirement is met.",
        "Continue to contribute 16 hours per semester (6 professional, 6 community service, 4 more hours of your choice of professional or service).",
        "Pay the Member fee",
        "Maintain at least a 3.0 major and overall GPA.",
        "All members are eligible to run for any position on the executive board, regardless of how long they have been members.",
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar
        isLogged={!!session}
        links={navLinks}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
      />

      <main className="flex-grow container mx-auto px-4 mt-24 flex flex-col items-center">
        <h1 className="text-5xl font-outfit font-bold text-bapred text-center pb-4 pt-4 sm:pt-8">
          Membership Process
        </h1>

        {/* Desktop view with arrows between cards */}
        <div className="hidden md:flex justify-center items-stretch gap-8 mb-16">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex-1 max-w-md">
                <ProcessStep {...step} />
              </div>
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center w-10">
                  <ProcessArrow />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile view as vertical cards with arrows between them */}
        <div className="md:hidden space-y-6 mb-12">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <ProcessStep {...step} />
              {index < steps.length - 1 && (
                <div className="py-2 flex justify-center">
                  <div className="w-10 transform rotate-90">
                    <ProcessArrow />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            className="text-white text-xl md:text-2xl font-bold px-8 py-4 bg-[#AF272F] hover:bg-[#8f1f25] transition-colors rounded-md shadow-md"
            onClick={() => (window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSciA9BqK7uwVXsjTAId5EJIw-kIvseIxHPeoCo7oGNWy6t3Wg/closedform")}
          >
            Click Here To Apply!
          </button>
        </div>

        <div className="mt-16 mb-16 max-w-4xl mx-auto px-4 py-6 border-t border-gray-200">
          <p className="text-gray-700 text-base md:text-lg leading-relaxed font-light italic">
            <span className="text-[#AF272F] font-medium mr-1">*</span>
            Have completed at least one major course (accounting, finance,
            business analytics or digital technology or corresponding to major
            area) beyond the principles or introductory level (for transfer
            students, the most recent qualifying course must be at the
            initiating institution). Do not need for candidate status, but need
            to have completed to reach member status.
          </p>
        </div>
      </main>
      <Footer backgroundColor="#AF272F" />
    </div>
  );
};
