import React from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import EmailList from "./EmailList";

interface AdminSponsorsSectionProps {
  sponsors: string[];
  loadingSponsors: boolean;
  handleAddSponsor: () => void;
  handleDeleteSponsor: (email: string) => void;
}

const AdminSponsorsSection: React.FC<AdminSponsorsSectionProps> = ({
  sponsors,
  loadingSponsors,
  handleAddSponsor,
  handleDeleteSponsor,
}) => (
  <div>
    <div className="flex items-center mb-2">
      <h2 className="text-2xl font-semibold">Sponsors</h2>
      <button
        className="ml-auto px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
        onClick={handleAddSponsor}
      >
        + <span className="hidden md:inline">New </span>Sponsor
      </button>
    </div>
    {loadingSponsors ? (
      <LoadingSpinner text="Loading sponsors..." size="md" />
    ) : (
      <EmailList
        emails={sponsors.map((email) => ({
          email,
          name: email,
          role: "sponsor",
        }))}
        onDelete={handleDeleteSponsor}
        userType="sponsor"
      />
    )}
  </div>
);

export default AdminSponsorsSection;
