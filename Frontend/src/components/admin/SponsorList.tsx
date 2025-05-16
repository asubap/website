import { useState } from "react";
import DeleteConfirmation from "./DeleteConfirmation";
import { useToast } from "../../context/toast/ToastContext";

interface SponsorListProps {
  emails: string[];
  tiers: string[];
  onDelete: (email: string) => void;
  userType: "admin" | "sponsor";
}

const SponsorList = ({ emails, tiers, onDelete, userType }: SponsorListProps) => {
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
  const { showToast } = useToast();

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

  return (
    <div className="w-full h-full flex flex-col py-2 gap-2 overflow-y-auto">
      {emails.map((email, index) => (
        <div
          key={email}
          className="w-full border border-bapgray rounded-md px-4 py-2 flex justify-between items-center"
        >
          <span>{email}</span>
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
