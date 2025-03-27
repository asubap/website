import { ChevronDown } from "lucide-react";
import BAPLogo from "../../assets/BAP_Logo.png";
import BackgroundImage from "../../assets/BAP_Homepage_BG.png";

export default function Hero() {
  const scrollToNextSection = () => {
    const whoWeAreSection = document.getElementById("who-we-are");
    whoWeAreSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative h-screen w-full overflow-x-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={BackgroundImage}
          alt="ASU Campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#101010] bg-opacity-70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
        <h1 className="text-5xl font-bold mb-4">BETA ALPHA PSI</h1>
        <h2 className="text-3xl mb-2">Beta Tau Chapter</h2>
        <h3 className="text-2xl mb-8">Arizona State University</h3>

        <img
          src={BAPLogo}
          alt="Beta Alpha Psi Logo"
          className="w-48 h-48 object-contain mt-8"
        />
      </div>

      {/* Bouncing Arrow */}
      <button
        onClick={scrollToNextSection}
        className="absolute bottom-8 right-12 animate-bounce cursor-pointer z-20"
        aria-label="Scroll to next section"
      >
        <ChevronDown size={40} className="text-white" />
      </button>
    </div>
  );
}
