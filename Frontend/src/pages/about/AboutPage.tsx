import { useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import BAPMap from "../../assets/BAP_Map.png";
import { getNavLinks } from "../../components/nav/NavLink";
import { useAuth } from "../../context/auth/authProvider";

export default function AboutPage() {
  const { session } = useAuth();

  // Load Vimeo embed script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        isLogged={!!session}
        links={getNavLinks(!!session)}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
      />

      <main className="flex-grow mt-16 sm:mt-20 md:mt-24 mb-8 sm:mb-12 px-8 sm:px-16 lg:px-24">
        <section>
          <h1 className="text-5xl font-outfit font-bold text-bapred pt-4 sm:pt-8">
            About Us
          </h1>

          {/* Introduction */}
          <div className="mb-6 sm:mb-10">
            <p className="text-gray-800 font-pt-serif text-base sm:text-md pt-4">
              Founded in 1919, Beta Alpha Psi is an honors organization for
              financial information students and professionals. There are over
              300 chapters on college and university campuses, with over 300,000
              members initiated since Beta Alpha Psi's formation. All of our
              chapters are{" "}
              <a
                href="https://www.aacsb.edu/"
                className="text-[#AF272F] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                AACSB
              </a>{" "}
              and/or{" "}
              <a
                href="https://www.equis.org/"
                className="text-[#AF272F] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                EQUIS
              </a>{" "}
              accredited. We are not a fraternity or sorority but an honors
              organization.
            </p>
          </div>

          {/* First Row: Vision/Mission and Video */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-12">
            {/* Vision & Mission (Left Column) */}
            <div className="order-2 md:order-1">
              <h2 className="text-xl sm:text-2xl font-bold font-outfit text-[#AF272F] mb-3 sm:mb-4 mt-6 md:mt-0">
                Vision
              </h2>
              <p className="text-gray-800 mb-4 sm:mb-6 font-pt-serif text-base sm:text-md">
                Beta Alpha Psi will shape the financial and business information
                professions by developing members into ethical, professional,
                and confident leaders.
              </p>

              <h2 className="text-xl sm:text-2xl font-bold font-outfit text-[#AF272F] mb-3 sm:mb-4">
                Mission
              </h2>
              <p className="text-gray-800 font-pt-serif text-base sm:text-md">
                The mission of Beta Alpha Psi, the premier international honor
                and service organization for financial and business information
                students and professionals, is to inspire and support excellence
                by: encouraging the study and practice of accountancy, finance,
                business analytics or digital technology; providing
                opportunities for service, professional development, and
                interaction among members and financial professionals; and
                fostering lifelong ethical, social, and public responsibilities.
              </p>
            </div>

            {/* Vimeo Video (Right Column) */}
            <div className="bg-gray-100 rounded-lg overflow-hidden order-1 md:order-2">
              <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                <iframe
                  src="https://player.vimeo.com/video/84151038?h=ecba82566f&color=AF272F&title=0&byline=0&portrait=0"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Why Beta Alpha Psi?"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Second Row: Map and Chapter Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-12">
            {/* Map (Left Column) */}
            <div className="md:pr-4">
              <img
                src={BAPMap}
                alt="Beta Alpha Psi Chapter Map with ASU Beta Tau Chapter highlighted"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>

            {/* Beta Tau Chapter Info (Right Column) */}
            <div>
              <p className="text-gray-800 mb-4 font-pt-serif text-base sm:text-md mt-4 md:mt-0">
                The Beta Tau chapter at Arizona State University was established
                in 2005 as the 65th chapter of Beta Alpha Psi. With over 900
                alumni, the Beta Tau chapter was created a vast alumni network
                among a variety of accounting firms, Fortune 500 companies and
                small businesses across the US and the world.
              </p>
              <p className="text-gray-800 mb-4 font-pt-serif text-base sm:text-md">
                The Beta Tau chapter holds a mixture of different service and
                professional events throughout the semester to prepare our
                members for a future in the accounting, finance, and information
                systems industries. Examples of events include:
              </p>

              <ul className="list-disc pl-4 sm:pl-6 mb-4 space-y-3 sm:space-y-4">
                <li className="text-gray-800 font-pt-serif text-base sm:text-md">
                  <span className="font-bold">Meet the Firms:</span> A privately
                  held event where BAP members have a chance to directly meet
                  with recruiters from several firms before W.P. Carey's Meet
                  the Firms, giving BAP members a more personal and earlier
                  exposure before all other ASU students.
                </li>
                <li className="text-gray-800 font-pt-serif text-base sm:text-md">
                  <span className="font-bold">Professional Panels:</span> Firm
                  presentations where BAP members can learn more about different
                  professional topics, services firms provide, firm culture, as
                  well as job/internship opportunities.
                </li>
                <li className="text-gray-800 font-pt-serif text-base sm:text-md">
                  <span className="font-bold">Jumpstart Service Event:</span> A
                  signature event where the Beta Tau chapter hosts local high
                  schools at ASU to teach them about a career opportunities at
                  Arizona State University.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer backgroundColor="#AF272F" />
    </div>
  );
}
