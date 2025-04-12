import { ProcessStep } from "../../components/ui/ProcessStep";
import { ProcessArrow } from "../../components/ui/ProcessArrow";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/auth/authProvider";

export const ProcessFlow = () => {
  const { session } = useAuth();
  
  // Define navigation links
  const navLinks = [
    { name: "About Us", href: "/about" },
    { name: "Our Sponsors", href: "/sponsors" },
    { name: "Events", href: "/events" },
    { name: "Membership", href: "/membership" },
  ];
  
  // Add login link only if user is not logged in
  if (!session) {
    navLinks.push({ name: "Log In", href: "/login" });
  }
  
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
    <div className="flex flex-col mt-20 min-h-screen bg-white">
      <Navbar
        isLogged={!!session}
        links={navLinks}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
      />

      <main className="flex flex-col items-center mt-10 px-5 py-10 max-sm:py-5">
        <div className="flex justify-between items-start w-full max-w-[1400px] max-md:flex-col max-md:gap-10">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-1 items-start">
              <ProcessStep {...step} />
              {index < steps.length - 1 && (
                <div className="flex mt-[200px]">
                  <ProcessArrow />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          className="text-white text-5xl font-bold w-full max-w-[785px] h-[100px] bg-[#AF272F] cursor-pointer mt-10 rounded-[10px] hover:bg-[#8f1f25] transition-colors"
          onClick={() => (window.location.href = "/apply")}
        >
          Click Here To Apply!
        </button>

        <div className="text-black text-2xl max-w-[1619px] text-center mt-10">
          * have completed at least one major course (accounting, finance,
          business analytics or digital technology or corresponding to major
          area) beyond the principles or introductory level (for transfer
          students, the most recent qualifying course must be at the initiating
          institution). Do not need for candidate status, but need to have
          completed to reach member status.
        </div>
      </main>
      <Footer backgroundColor="#AF272F" />
    </div>
  );
};
