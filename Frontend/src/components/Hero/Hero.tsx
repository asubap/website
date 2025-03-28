import { ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import BAPLogo from "../../assets/BAP_Logo.png";
import BackgroundImage from "../../assets/BAP_Homepage_BG.png";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1, // When 10% of the hero is visible
      }
    );

    const currentHeroRef = heroRef.current;

    if (currentHeroRef) {
      observer.observe(currentHeroRef);
    }

    return () => {
      if (currentHeroRef) {
        observer.unobserve(currentHeroRef);
      }
    };
  }, []);

  const scrollToNextSection = () => {
    const whoWeAreSection = document.getElementById("who-we-are");
    whoWeAreSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={heroRef}
      id="hero"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={BackgroundImage}
          alt="ASU Campus"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          style={{
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        />
        <div
          className="absolute inset-0 bg-[#101010] bg-opacity-70"
          style={{
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
        <h1 className="text-5xl font-bold mb-4 font-arial">BETA ALPHA PSI</h1>
        <h2 className="text-3xl mb-2 font-bold font-pt-serif">
          Beta Tau Chapter
        </h2>
        <h3 className="text-2xl font-bold font-pt-serif">
          Arizona State University
        </h3>

        <img
          src={BAPLogo}
          alt="Beta Alpha Psi Logo"
          className="w-64 h-64 object-contain mt-4"
          loading="eager"
        />
      </div>

      {/* Bouncing Arrow - Only shown when hero section is visible */}
      {isVisible && (
        <button
          onClick={scrollToNextSection}
          className="absolute bottom-8 right-12 animate-bounce cursor-pointer z-20"
          aria-label="Scroll to next section"
          style={{
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        >
          <ChevronDown size={40} className="text-white" />
        </button>
      )}
    </div>
  );
}
