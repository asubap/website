import React from "react";

interface SponsorTierProps {
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  children: React.ReactNode;
}

const SponsorTier: React.FC<SponsorTierProps> = ({ tier, children }) => {
  // Map tiers to their colors based on the BAP colors
  const tierColors = {
    Platinum: "text-bapgray",
    Gold: "text-yellow-600",
    Silver: "text-gray-400",
    Bronze: "text-amber-800",
  };

  return (
    <section className="mb-16 w-full max-w-7xl mx-auto px-4">
      <h2
        className={`text-4xl font-bold font-arial ${tierColors[tier]} text-center mb-8`}
      >
        {tier}
      </h2>
      <div className="flex flex-wrap justify-center items-center gap-4">
        {children}
      </div>
    </section>
  );
};

export default SponsorTier;
