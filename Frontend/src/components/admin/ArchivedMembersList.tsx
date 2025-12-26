import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth/authProvider";
import { useToast } from "../../context/toast/ToastContext";
import { getArchivedMembers, restoreMember, ArchivedMember } from "../../services/memberArchiveService";
import LoadingSpinner from "../common/LoadingSpinner";
import SearchInput from "../common/SearchInput";
import { RotateCcw } from "lucide-react";
import RestoreConfirmDialog from "./RestoreConfirmDialog";

interface ArchivedMembersListProps {
  onMemberRestored?: () => void;
  onRefreshRequested?: (refreshFn: () => void) => void;
}

const ArchivedMembersList = ({ onMemberRestored, onRefreshRequested }: ArchivedMembersListProps) => {
  const [archivedMembers, setArchivedMembers] = useState<ArchivedMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [memberToRestore, setMemberToRestore] = useState<ArchivedMember | null>(null);
  const { session } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchArchivedMembers();
    // Pass the refresh function to parent
    if (onRefreshRequested) {
      onRefreshRequested(fetchArchivedMembers);
    }
  }, [session]);

  const fetchArchivedMembers = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      const token = session.access_token;
      const members = await getArchivedMembers(token);
      setArchivedMembers(members);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to load archived members",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreClick = (member: ArchivedMember, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemberToRestore(member);
  };

  const handleConfirmRestore = async () => {
    if (!memberToRestore || !session) return;

    try {
      setIsRestoring(true);
      const token = session.access_token;
      await restoreMember(memberToRestore.email, token);

      showToast(`${memberToRestore.name} has been restored successfully`, "success");

      // Remove from archived list
      setArchivedMembers(prev => prev.filter(m => m.email !== memberToRestore.email));
      setMemberToRestore(null);

      // Notify parent component
      onMemberRestored?.();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to restore member",
        "error"
      );
    } finally {
      setIsRestoring(false);
    }
  };

  // Filter members based on search query
  const filteredMembers = archivedMembers.filter(({ email, name }) => {
    const searchText = `${name} ${email}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <LoadingSpinner text="Loading archived members..." size="md" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {/* Search Bar */}
      <div className="flex items-center gap-2 w-full mb-2">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search archived members..."
          containerClassName="flex-grow"
          inputClassName="px-3 py-2"
        />
      </div>

      {/* Members List */}
      <div className="w-full h-[300px] flex flex-col py-2 gap-2 overflow-y-scroll scrollbar-thumb-bapgray scrollbar-track-bapgraylight">
        {filteredMembers.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500 text-center">
              {searchQuery ? "No archived members match your search" : "No archived members"}
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.email}
              className="w-full border border-bapgray rounded-md px-4 py-2 flex justify-between items-center"
            >
              <span className="text-gray-800 text-m pr-2">
                {member.name}
                {member.rank && (
                  <span className="text-xs ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {member.rank}
                  </span>
                )}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => handleRestoreClick(member, e)}
                  disabled={isRestoring}
                  className="text-green-600 hover:text-green-800 p-1"
                  aria-label={`Restore ${member.name}`}
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Restore Confirmation Dialog */}
      {memberToRestore && (
        <RestoreConfirmDialog
          memberName={memberToRestore.name}
          memberEmail={memberToRestore.email}
          onConfirm={handleConfirmRestore}
          onCancel={() => setMemberToRestore(null)}
          isLoading={isRestoring}
        />
      )}
    </div>
  );
};

export default ArchivedMembersList;
