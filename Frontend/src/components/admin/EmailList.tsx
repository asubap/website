import { useState } from "react";
import DeleteConfirmation from "./DeleteConfirmation";
import { useToast } from "../../context/toast/ToastContext";
import AdminMemberEditModal from "./AdminMemberEditModal";
import LoadingSpinner from "../common/LoadingSpinner";
import SearchInput from "../common/SearchInput";
import { Trash2, MoreHorizontal } from "lucide-react";
import { MemberDetail } from "../../types";

// Temporary: Re-declaring MemberDetail to match Admin.tsx for now.
// TODO: Move MemberDetail to a shared types file and import it.
// interface MemberDetail { ... } // Removed local definition

interface EmailListProps {
  emails: { email: string; name?: string; role?: string }[];
  onDelete: (email: string) => void;
  userType: "admin" | "sponsor";
  onEdit?: (email: string) => void;
  memberDetails?: { [key: string]: MemberDetail };
  onSave?: (updatedData: MemberDetail) => Promise<void> | void;
  clickable?: boolean;
}

const EmailList = ({
  emails,
  onDelete,
  userType,
  onEdit,
  memberDetails = {},
  onSave,
  clickable = true,
}: EmailListProps) => {
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
    const member = emails.find((m) => m.email === email);

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

  const handleEditSave = async (updatedData: MemberDetail) => {
    // Using the shared/imported MemberDetail type
    if (onSave) {
      await onSave(updatedData);
    }
    setEmailToEdit(null);
  };

  // Filter emails based on search query
  const filteredEmails = emails.filter(({ email, name }) =>
    (name || email).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Search Bar */}
      <SearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search members by name or email..."
        containerClassName="mb-2"
      />
      {isLoading && (
        <div className="fixed inset-0 z-50">
          <div className="flex min-h-screen items-center justify-center">
            <div className="relative bg-white rounded-lg p-6 shadow-xl">
              <LoadingSpinner text="Loading member details..." size="lg" />
            </div>
          </div>
        </div>
      )}
      <div className="w-full h-[300px] flex flex-col py-2 gap-2 overflow-y-scroll scrollbar-thin scrollbar-thumb-bapgray scrollbar-track-bapgraylight">
        {filteredEmails.map(({ email, name }) => (
          <div
            key={email}
            onClick={clickable ? () => handleEditClick(email) : undefined}
            className={`w-full border border-bapgray rounded-md px-4 py-2 flex justify-between items-center ${
              clickable && userType === "admin"
                ? "cursor-pointer hover:bg-gray-50 transition-colors"
                : ""
            }`}
          >
            <span className="text-gray-800 text-m pr-2">
              {name ? name : email}
            </span>
            <div className="flex items-center space-x-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(email);
                  }}
                  className="text-gray-600 hover:text-bapred p-1"
                  aria-label={`Edit ${name || email}`}
                >
                  <MoreHorizontal size={16} />
                </button>
              )}
              <button
                onClick={(e) => handleDeleteClick(email, e)}
                className="text-bapred hover:text-bapreddark p-1"
                aria-label={`Delete ${email}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
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

        {emailToEdit &&
          emails.find((m) => m.email === emailToEdit)?.role !== "e-board" && (
            <AdminMemberEditModal
              isOpen={true}
              onClose={() => setEmailToEdit(null)}
              // Assuming profileData in AdminMemberEditModal expects MemberDetail or a compatible type
              profileData={
                memberDetails && emailToEdit ? memberDetails[emailToEdit] : null
              }
              isLoading={
                memberDetails && emailToEdit
                  ? !memberDetails[emailToEdit]
                  : true
              }
              onSave={handleEditSave}
            />
          )}
      </div>
    </>
  );
};

export default EmailList;
