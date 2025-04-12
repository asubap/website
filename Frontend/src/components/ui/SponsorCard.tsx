import React from "react";

interface SponsorCardProps {
  name: string;
  imageUrl: string;
  tier?: "platinum" | "gold" | "silver" | "bronze";
}

const SponsorCard: React.FC<SponsorCardProps> = ({
  name,
  imageUrl,
  tier = "gold",
}) => {
  // Subtle tier-based shadow styling instead of borders
  const tierStyles = {
    platinum: "shadow-xl",
    gold: "shadow-lg",
    silver: "shadow-md",
    bronze: "shadow",
  };

  return (
    <div
      className={`bg-white rounded-lg ${tierStyles[tier]} w-56 h-56 flex flex-col items-center justify-center transition-transform hover:scale-105 m-4`}
    >
      <div className="overflow-hidden w-full h-3/4 flex items-center justify-center p-4">
        <img
          src={imageUrl}
          alt={`${name} logo`}
          className="object-contain max-w-full max-h-full"
        />
      </div>
      <div className="h-1/4 flex items-center justify-center">
        <h3 className="text-center font-bold text-bapgray font-outfit text-sm sm:text-base">
          {name}
        </h3>
      </div>
    </div>
  );
};

export default SponsorCard;
