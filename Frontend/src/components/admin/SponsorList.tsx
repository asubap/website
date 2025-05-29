import { useState } from "react";
import DeleteConfirmation from "./DeleteConfirmation";
import { useToast } from "../../context/toast/ToastContext";
import { useAuth } from "../../context/auth/authProvider";
import ProfileEditModal from "../sponsor/ProfileEditModal";
import LoadingSpinner from "../common/LoadingSpinner";
import SearchInput from "../common/SearchInput";
import { Trash2 } from "lucide-react";

interface SponsorListProps {
  emails: string[];
  tiers: string[];
  onDelete: (email: string) => void;
  userType: "admin" | "sponsor";
  onTierChanged?: () => void;
  onTierChangeConfirm: (
    email: string,
    newTier: string,
    successCallback: () => void
  ) => void;
}

interface SponsorProfileData {
  sponsorName: string;
  sponsorDescription: string;
  links: string[];
  profileUrl: string;
}

const SponsorList = ({
  emails,
  tiers,
  onDelete,
  userType,
  onTierChangeConfirm,
}: SponsorListProps) => {
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sponsorToEdit, setSponsorToEdit] = useState<string | null>(null);
  const [sponsorProfile, setSponsorProfile] =
    useState<SponsorProfileData | null>(null);
  const { showToast } = useToast();
  const { session } = useAuth();
  const [loadingSponsor, setLoadingSponsor] = useState(false);

  const handleDeleteClick = (email: string) => {
    setEmailToDelete(email);
  };

  const handleEditClick = async (email: string) => {
    if (!session?.access_token) return;
    setLoadingSponsor(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/get-one-sponsor-info`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sponsor_name: email }),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch sponsor details");
      const data = await response.json();
      const fetchedLinks = (data.links || []).map(
        (link: { type: string; url: string }) => link.url
      );
      setSponsorProfile({
        sponsorName: data.company_name || email,
        sponsorDescription: data.about || data.description || "",
        links: fetchedLinks,
        profileUrl: data.pfp_url || data.profileUrl || "",
      });
      setSponsorToEdit(email);
    } catch (error) {
      console.error("Failed to fetch sponsor details:", error);
      showToast("Failed to fetch sponsor details", "error");
    } finally {
      setLoadingSponsor(false);
    }
  };

  const handleSponsorUpdate = async (updatedProfile: {
    description: string;
    links: string[];
  }) => {
    if (!sponsorToEdit || !session?.access_token) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorToEdit}/details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            about: updatedProfile.description,
            links: updatedProfile.links,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update sponsor details");
      showToast("Sponsor updated successfully", "success");
      setSponsorToEdit(null);
      setSponsorProfile(null);
    } catch (error) {
      console.error("Failed to update sponsor details:", error);
      showToast("Failed to update sponsor details", "error");
    }
  };

  const handleConfirmDelete = () => {
    if (emailToDelete) {
      onDelete(emailToDelete);
      showToast(
        `${userType === "admin" ? "Admin" : "Sponsor"} removed successfully`,
        "success"
      );
      setEmailToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setEmailToDelete(null);
  };

  const handleChangeTier = async (email: string, newTier: string) => {
    onTierChangeConfirm(email, newTier, () => {
      // This successCallback will be invoked by Admin.tsx after API success
      // The onTierChanged prop (e.g., refetchSponsors) is managed by Admin.tsx
      // after successful update.
    });
  };

  // Filter sponsors based on search query
  const filteredSponsors = emails
    .map((email, index) => ({ email, tier: tiers[index] }))
    .filter(({ email }) =>
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <>
      {/* Search Bar */}
      <SearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search sponsors by name or email..."
        containerClassName="mb-2"
      />
      <div className="w-full h-[300px] flex flex-col py-2 gap-2 overflow-y-scroll scrollbar-thin scrollbar-thumb-bapgray scrollbar-track-bapgraylight">
        {loadingSponsor && (
          <div className="fixed inset-0 z-50">
            <div className="flex min-h-screen items-center justify-center">
              <div className="relative bg-white rounded-lg p-6 shadow-xl">
                <LoadingSpinner text="Loading sponsor details..." size="lg" />
              </div>
            </div>
          </div>
        )}
        {filteredSponsors.map(({ email, tier }) => (
          <div
            key={email}
            className="w-full border border-bapgray rounded-md px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleEditClick(email)}
          >
            <span className="text-gray-800 text-m pr-2">{email}</span>
            <select
              value={tier}
              onChange={(e) => handleChangeTier(email, e.target.value)}
              className="ml-auto pr-1 rounded-md bg-bapgraylight text-bapgray font-bold focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </select>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(email);
              }}
              className="text-bapred pl-3 hover:text-bapreddark p-1"
              aria-label={`Delete ${email}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {emailToDelete && (
          <DeleteConfirmation
            email={emailToDelete}
            userType={userType}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}

        {sponsorToEdit && sponsorProfile && (
          <ProfileEditModal
            isOpen={true}
            onClose={() => {
              setSponsorToEdit(null);
              setSponsorProfile(null);
            }}
            sponsorName={sponsorProfile.sponsorName}
            sponsorDescription={sponsorProfile.sponsorDescription}
            onUpdate={handleSponsorUpdate}
            token={session?.access_token || ""}
            profileUrl={sponsorProfile.profileUrl}
            links={sponsorProfile.links}
          />
        )}
      </div>
    </>
  );
};

export default SponsorList;
