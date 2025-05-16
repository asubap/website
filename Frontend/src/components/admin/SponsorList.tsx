import { useState } from "react";
import DeleteConfirmation from "./DeleteConfirmation";
import { useToast } from "../../context/toast/ToastContext";
import { useAuth } from "../../context/auth/authProvider";

interface SponsorListProps {
  emails: string[];
  tiers: string[];
  onDelete: (email: string) => void;
  userType: "admin" | "sponsor";
}

const SponsorList = ({ emails, tiers, onDelete, userType }: SponsorListProps) => {
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
  const { showToast } = useToast();
  const { session } = useAuth();
  
  const handleDeleteClick = (email: string) => {
    setEmailToDelete(email);
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
    const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/change-sponsor-tier`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ sponsor_name: email, tier: newTier }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        showToast(errorData.message, "error");
      }

      // refresh the page
      window.location.reload();

      showToast("Tier changed successfully", "success");
  };

  return (
    <div className="w-full h-full flex flex-col py-2 gap-2 overflow-y-auto">
      {emails.map((email, index) => (
        <div
          key={email}
          className="w-full border border-bapgray rounded-md px-4 py-2 flex justify-between items-center"
        >
          <span>{email}</span>
          <select
            value={tiers[index]}
            onChange={(e) => handleChangeTier(email, e.target.value)}
            className="ml-auto pr-2 rounded-md bg-bapgraylight text-bapgray font-bold focus:outline-none"
          >
            <option value="platinum">Platinum</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
          </select>
          <button
            onClick={() => handleDeleteClick(email)}
            className="text-bapred hover:text-bapreddark font-bold pl-8"
          <span className="text-bapgray ml-auto pr-4 rounded-md bg-bapgraylight">{tiers[index]}</span>
          <button
            onClick={() => handleDeleteClick(email)}
            className="text-bapred hover:text-bapreddark font-bold"
            aria-label={`Delete ${email}`}
          >
            ×
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
    </div>
  );
};

export default SponsorList;
