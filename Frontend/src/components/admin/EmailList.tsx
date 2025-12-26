import { useState } from "react";
import DeleteConfirmation from "./DeleteConfirmation";
import { useToast } from "../../context/toast/ToastContext";
import AdminMemberEditModal from "./AdminMemberEditModal";
import LoadingSpinner from "../common/LoadingSpinner";
import SearchInput from "../common/SearchInput";
import { Trash2, MoreHorizontal } from "lucide-react";
import { MemberDetail } from "../../types";
import ArchiveConfirmDialog from "./ArchiveConfirmDialog";

// Temporary: Re-declaring MemberDetail to match Admin.tsx for now.
// TODO: Move MemberDetail to a shared types file and import it.
// interface MemberDetail { ... } // Removed local definition

interface EmailListProps {
  emails: { email: string; name?: string; role?: string; rank?: string }[];
  onDelete: (email: string) => void;
  userType: "admin" | "sponsor" | "member";
  onEdit?: (email: string) => void;
  memberDetails?: { [key: string]: MemberDetail };
  onSave?: (updatedData: MemberDetail) => Promise<void> | void;
  clickable?: boolean;
  onCreateNew?: () => void;
  showRankFilter?: boolean;
  useArchiveForDelete?: boolean; // When true, delete button will archive instead
  onArchiveSuccess?: () => void; // Called after successful archive to refresh archived list
}

const EmailList = ({
  emails,
  onDelete,
  userType,
  onEdit,
  memberDetails = {},
  onSave,
  clickable = true,
  onCreateNew,
  showRankFilter = false,
  useArchiveForDelete = false,
  onArchiveSuccess,
}: EmailListProps) => {
  const [emailToDelete, setEmailToDelete] = useState<{ email: string; name: string } | null>(null);
  const [emailToEdit, setEmailToEdit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const { showToast } = useToast();

  const handleDeleteClick = (email: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmailToDelete({ email, name });
  };

  const handleEditClick = async (email: string) => {
    // Find the member in the emails array
    const member = emails.find((m) => m.email === email);

    // If the member is e-board, do nothing
    if (member?.role === "e-board") return;

    setIsLoading(true);
    onEdit?.(email);
    setIsLoading(false);

    setEmailToEdit(email);
  };

  const userTypeDisplayMap: Record<string, string> = {
    admin: "Admin",
    sponsor: "Sponsor",
    member: "Member",
    "general-member": "Member", // if you use this key elsewhere
  };

  const handleConfirmDelete = async () => {
    if (!emailToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(emailToDelete.email);
      if (useArchiveForDelete) {
        showToast(`${emailToDelete.name} has been archived successfully`, "success");
        // Call the callback to refresh archived members list
        onArchiveSuccess?.();
      } else {
        showToast(
          `${userTypeDisplayMap[userType] || "User"} removed successfully`,
          "success"
        );
      }
      setEmailToDelete(null);
    } catch (error) {
      showToast(
        useArchiveForDelete ? "Failed to archive member" : `Failed to remove ${userType}`,
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSave = async (updatedData: MemberDetail) => {
    // Using the shared/imported MemberDetail type
    if (onSave) {
      await onSave(updatedData);
    }
    setEmailToEdit(null);
  };

  // Filter emails based on search query and rank - also filter out invalid entries
  const filteredEmails = emails
    .filter(item => item && item.email) // Only include items with valid email
    .filter(({ email, name, rank }) => {
      const searchText = (name || email || '').toLowerCase();
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());
      const matchesRank = !rankFilter || rank === rankFilter;
      return matchesSearch && matchesRank;
    });

  return (
    <div className="w-full flex flex-col">
      {/* Search Bar, Filter, and Add Button */}
      <div className="flex items-center gap-2 w-full mb-2">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${userType}s...`}
          containerClassName="flex-grow"
          inputClassName="px-3 py-2"
        />
        {showRankFilter && (
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="">All Ranks</option>
            <option value="Inducted">Inducted</option>
            <option value="Pledge">Pledge</option>
            <option value="Alumni">Alumni</option>
          </select>
        )}
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="bg-bapred text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center justify-center whitespace-nowrap text-sm font-medium"
          >
            <span className="mr-1">+</span>
            <span className="hidden md:inline mr-1">New</span>
            {userTypeDisplayMap[userType] || "Member"}
          </button>
        )}
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
      <div className="w-full h-[300px] flex flex-col py-2 gap-2 overflow-y-scroll scrollbar-thumb-bapgray scrollbar-track-bapgraylight">
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
                onClick={(e) => handleDeleteClick(email, name || email, e)}
                className="text-bapred hover:text-bapreddark p-1"
                aria-label={`Delete ${email}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {emailToDelete && !useArchiveForDelete && (
          <DeleteConfirmation
            name={emailToDelete.name}
            userType={userType}
            onConfirm={handleConfirmDelete}
            onCancel={() => setEmailToDelete(null)}
          />
        )}

        {emailToDelete && useArchiveForDelete && (
          <ArchiveConfirmDialog
            memberName={emailToDelete.name}
            memberEmail={emailToDelete.email}
            onConfirm={handleConfirmDelete}
            onCancel={() => setEmailToDelete(null)}
            isLoading={isDeleting}
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
    </div>
  );
};

export default EmailList;
