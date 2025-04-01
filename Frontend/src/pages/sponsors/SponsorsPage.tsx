import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import SponsorCard from "../../components/ui/SponsorCard";
import SponsorTier from "../../components/ui/SponsorTier";

// Import sponsor images
import mossAdamsImg from "../../assets/sponsors/mossadams.jpeg";
import bakerTillyImg from "../../assets/sponsors/bakertilly.jpeg";
import deloitteImg from "../../assets/sponsors/deloitte.webp";
import eideBaillyImg from "../../assets/sponsors/eidebaily.png";
import eyImg from "../../assets/sponsors/ey.png";
import forvisMazarsImg from "../../assets/sponsors/forvismazars.png";
import grantThorntonImg from "../../assets/sponsors/grantthornton.webp";
import pwcImg from "../../assets/sponsors/pwc.png";
import rsmImg from "../../assets/sponsors/rsm.jpeg";
import abdoImg from "../../assets/sponsors/abdo.png";
import bdoImg from "../../assets/sponsors/bdo.png";
import cbizImg from "../../assets/sponsors/cbiz.jpeg";
import claImg from "../../assets/sponsors/cla.png";
import frankRimermanImg from "../../assets/sponsors/frankrimerman.jpeg";
import haynieImg from "../../assets/sponsors/haynieco.png";
import hcvtImg from "../../assets/sponsors/hcvt.jpeg";
import iiaImg from "../../assets/sponsors/ioia.jpeg";
import kpmgImg from "../../assets/sponsors/kpmg.png";
import mbeImg from "../../assets/sponsors/mbacpas.jpeg";
import equityMethodsImg from "../../assets/sponsors/equitymethods.jpeg";
import heinfeldMeechImg from "../../assets/sponsors/heinfeldmeech.png";
import honeywellImg from "../../assets/sponsors/honeywell.png";

// Interface for sponsor data
interface Sponsor {
  id: number;
  name: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
  imageUrl: string;
}

export default function SponsorsPage() {
  // Define navigation links to pass to Navbar
  const navLinks = [
    { name: "About Us", href: "/about" },
    { name: "Our Sponsors", href: "/sponsors" },
    { name: "Events", href: "/events" },
    { name: "Membership", href: "/membership" },
    { name: "Log In", href: "/login" },
  ];

  // Sample sponsor data with actual image imports
  const sponsors: Sponsor[] = [
    // Platinum sponsors
    {
      id: 1,
      name: "Moss Adams",
      tier: "platinum",
      imageUrl: mossAdamsImg,
    },

    // Gold sponsors
    {
      id: 2,
      name: "Baker Tilly",
      tier: "gold",
      imageUrl: bakerTillyImg,
    },
    {
      id: 3,
      name: "Deloitte",
      tier: "gold",
      imageUrl: deloitteImg,
    },
    {
      id: 4,
      name: "Eide Bailly",
      tier: "gold",
      imageUrl: eideBaillyImg,
    },
    { id: 5, name: "EY", tier: "gold", imageUrl: eyImg },
    {
      id: 6,
      name: "Forvis Mazars",
      tier: "gold",
      imageUrl: forvisMazarsImg,
    },
    {
      id: 7,
      name: "Grant Thornton",
      tier: "gold",
      imageUrl: grantThorntonImg,
    },
    { id: 8, name: "PwC", tier: "gold", imageUrl: pwcImg },
    { id: 9, name: "RSM", tier: "gold", imageUrl: rsmImg },

    // Silver sponsors
    { id: 10, name: "Abdo", tier: "silver", imageUrl: abdoImg },
    { id: 11, name: "BDO", tier: "silver", imageUrl: bdoImg },
    { id: 12, name: "CBIZ", tier: "silver", imageUrl: cbizImg },
    { id: 13, name: "CLA", tier: "silver", imageUrl: claImg },
    {
      id: 14,
      name: "Frank, Rimerman + Co.",
      tier: "silver",
      imageUrl: frankRimermanImg,
    },
    {
      id: 15,
      name: "Haynie & Company",
      tier: "silver",
      imageUrl: haynieImg,
    },
    { id: 16, name: "HCVT", tier: "silver", imageUrl: hcvtImg },
    {
      id: 17,
      name: "The Institute of Internal Auditors",
      tier: "silver",
      imageUrl: iiaImg,
    },
    { id: 18, name: "KPMG", tier: "silver", imageUrl: kpmgImg },
    { id: 19, name: "MBE CPAs", tier: "silver", imageUrl: mbeImg },

    // Bronze sponsors
    {
      id: 20,
      name: "Equity Methods",
      tier: "bronze",
      imageUrl: equityMethodsImg,
    },
    {
      id: 21,
      name: "Heinfeld Meech",
      tier: "bronze",
      imageUrl: heinfeldMeechImg,
    },
    {
      id: 22,
      name: "Honeywell",
      tier: "bronze",
      imageUrl: honeywellImg,
    },
  ];

  // Filter sponsors by tier
  const platinumSponsors = sponsors.filter(
    (sponsor) => sponsor.tier === "platinum"
  );
  const goldSponsors = sponsors.filter((sponsor) => sponsor.tier === "gold");
  const silverSponsors = sponsors.filter(
    (sponsor) => sponsor.tier === "silver"
  );
  const bronzeSponsors = sponsors.filter(
    (sponsor) => sponsor.tier === "bronze"
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        links={navLinks}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
      />

      <main className="flex-grow container mx-auto px-4 mt-24 flex flex-col items-center">
        <h1 className="text-5xl font-arial font-bold text-bapred text-center pt-4 sm:pt-8">
          Our Sponsors
        </h1>
        <p className="text-center text-bapgray text-xl pt-4 pb-4 px-8 sm:px-16 lg:px-24">
          We would like to thank all of our sponsors for their generous support
          of Beta Alpha Psi. Their contributions help us provide valuable
          professional development opportunities for our members.
        </p>

        {/* Platinum Tier */}
        {platinumSponsors.length > 0 && (
          <SponsorTier tier="Platinum">
            {platinumSponsors.map((sponsor) => (
              <SponsorCard
                key={sponsor.id}
                name={sponsor.name}
                imageUrl={sponsor.imageUrl}
                tier="platinum"
              />
            ))}
          </SponsorTier>
        )}

        {/* Gold Tier */}
        {goldSponsors.length > 0 && (
          <SponsorTier tier="Gold">
            {goldSponsors.map((sponsor) => (
              <SponsorCard
                key={sponsor.id}
                name={sponsor.name}
                imageUrl={sponsor.imageUrl}
                tier="gold"
              />
            ))}
          </SponsorTier>
        )}

        {/* Silver Tier */}
        {silverSponsors.length > 0 && (
          <SponsorTier tier="Silver">
            {silverSponsors.map((sponsor) => (
              <SponsorCard
                key={sponsor.id}
                name={sponsor.name}
                imageUrl={sponsor.imageUrl}
                tier="silver"
              />
            ))}
          </SponsorTier>
        )}

        {/* Bronze Tier */}
        {bronzeSponsors.length > 0 && (
          <SponsorTier tier="Bronze">
            {bronzeSponsors.map((sponsor) => (
              <SponsorCard
                key={sponsor.id}
                name={sponsor.name}
                imageUrl={sponsor.imageUrl}
                tier="bronze"
              />
            ))}
          </SponsorTier>
        )}
      </main>

      <Footer backgroundColor="#AF272F" />
    </div>
  );
}
