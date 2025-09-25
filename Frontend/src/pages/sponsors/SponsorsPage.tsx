import { useEffect, useRef, useState } from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import SponsorCard from "../../components/ui/SponsorCard";
import SponsorTier from "../../components/ui/SponsorTier";
import { getNavLinks } from "../../components/nav/NavLink";
import { useAuth } from "../../context/auth/authProvider";

// Interface for sponsor data - This will be used for the *processed* data
interface Sponsor {
  id: number;
  name: string; // Keep as 'name' for consistency within this component and for SponsorCard
  tier: "platinum" | "gold" | "silver" | "bronze";
  imageUrl: string; // Keep as 'imageUrl' for consistency
}

// Define a type for the raw data coming from the API
interface ApiSponsorData {
  id: number;
  company_name: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
  pfp_url: string;
  // include other fields from API if needed, like about, links, emails, uuid, resources
}

export default function SponsorsPage() {
  const { session } = useAuth();

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [platinumSponsors, setPlatinumSponsors] = useState<Sponsor[]>([]);
  const [goldSponsors, setGoldSponsors] = useState<Sponsor[]>([]);
  const [silverSponsors, setSilverSponsors] = useState<Sponsor[]>([]);
  const [bronzeSponsors, setBronzeSponsors] = useState<Sponsor[]>([]);
  const hasFetchedSponsors = useRef(false);

  // Effect 1: Fetch sponsors on component mount
  useEffect(() => {
    const fetchSponsorsData = async () => {
      try {
        const response = await fetch(
          "https://asubap-backend.vercel.app/sponsors/"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiSponsorData[] = await response.json(); // Use the new ApiSponsorData type

        // Transform the fetched data into the desired format
        const formattedSponsors = data.map((apiSponsor: ApiSponsorData) => ({
          id: apiSponsor.id,
          name: apiSponsor.company_name, // Map from company_name
          tier: apiSponsor.tier,
          imageUrl: apiSponsor.pfp_url, // Map from pfp_url
        }));

        // Set the sponsors state ONCE with the complete list
        setSponsors(formattedSponsors);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
      }
    };

    if (!hasFetchedSponsors.current) {
      fetchSponsorsData();
      hasFetchedSponsors.current = true;
    }
  }, []); // Empty dependency array: runs only once when the component mounts

  // Effect 2: Sort sponsors whenever the 'sponsors' state changes
  useEffect(() => {
    // Only sort if there are sponsors to avoid unnecessary operations
    if (sponsors.length > 0) {
      setPlatinumSponsors(
        sponsors.filter((sponsor) => sponsor.tier === "platinum")
      );
      setGoldSponsors(sponsors.filter((sponsor) => sponsor.tier === "gold"));
      setSilverSponsors(
        sponsors.filter((sponsor) => sponsor.tier === "silver")
      );
      setBronzeSponsors(
        sponsors.filter((sponsor) => sponsor.tier === "bronze")
      );
    } else {
      // Optionally, clear the sorted arrays if the main sponsors list is empty
      setPlatinumSponsors([]);
      setGoldSponsors([]);
      setSilverSponsors([]);
      setBronzeSponsors([]);
    }
  }, [sponsors]); // This effect runs whenever the 'sponsors' state array changes

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        isLogged={!!session}
        links={getNavLinks(!!session)}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
      />

      <main className="flex-grow p-8 pt-32 px-8 sm:px-16 lg:px-24 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-bapred mb-6 text-center">
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
