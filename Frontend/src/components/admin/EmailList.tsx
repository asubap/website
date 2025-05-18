import { useState } from "react";
import DeleteConfirmation from "./DeleteConfirmation";
import { useToast } from "../../context/toast/ToastContext";
import AdminMemberEditModal from "./AdminMemberEditModal";
import LoadingSpinner from "../common/LoadingSpinner";

interface EmailListProps {
  emails: { email: string; name?: string; role?: string }[];
  onDelete: (email: string) => void;
  userType: "admin" | "sponsor";
  onEdit?: (email: string) => void;
  memberDetails?: { [key: string]: any };
  onSave?: (email: string) => Promise<void> | void;
}

const EmailList = ({ emails, onDelete, userType, onEdit, memberDetails = {}, onSave }: EmailListProps) => {
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
  const [emailToEdit, setEmailToEdit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  const handleDeleteClick = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmailToDelete(email);
  };

  const handleEditClick = async (email: string) => {
    // Find the member in the emails array
    const member = emails.find(m => m.email === email);

    // If the member is e-board, do nothing
    if (member?.role === "e-board") return;

    setIsLoading(true);
    await onEdit?.(email);
    setIsLoading(false);

    setEmailToEdit(email);
  };

  const handleConfirmDelete = () => {
    if (!emailToDelete) return;
    onDelete(emailToDelete);
    showToast(
      `${userType === "admin" ? "Admin" : "Sponsor"} removed successfully`,
      "success"
    );
    setEmailToDelete(null);
  };

  const handleEditSave = async (updatedData: any) => {
    await onSave?.(updatedData.email);
    setEmailToEdit(null);
  };

  // Filter emails based on search query
  const filteredEmails = emails.filter(({ email, name }) =>
    (name || email).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Search Bar */}
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search members by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-bapred transition-colors border-gray-300"
        />
      </div>
      {isLoading && (
        <div className="fixed inset-0 z-50">
          <div className="flex min-h-screen items-center justify-center">
            <div className="relative bg-white rounded-lg p-6 shadow-xl">
              <LoadingSpinner text="Loading member details..." size="lg" />
            </div>
          </div>
        </div>
      )}
      <div className="w-full h-full flex flex-col py-2 gap-2 overflow-y-auto">
        {filteredEmails.map(({ email, name }) => (
          <div
            key={email}
            onClick={() => handleEditClick(email)}
            className={`w-full border border-bapgray rounded-md px-4 py-2 flex justify-between items-center ${
              userType === "admin" ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""
            }`}
          >
            <span>{name ? name : email}</span>
            <button
              onClick={(e) => handleDeleteClick(email, e)}
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
            onCancel={() => setEmailToDelete(null)}
          />
        )}

        {emailToEdit && emails.find(m => m.email === emailToEdit)?.role !== "e-board" && (
          <AdminMemberEditModal
            isOpen={true}
            onClose={() => setEmailToEdit(null)}
            profileData={memberDetails[emailToEdit] || null}
            isLoading={!memberDetails[emailToEdit]}
            onSave={handleEditSave}
          />
        )}
      </div>
    </>
  );
};

export default EmailList;
