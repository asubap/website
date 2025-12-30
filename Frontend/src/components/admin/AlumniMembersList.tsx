import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth/authProvider";
import { useToast } from "../../context/toast/ToastContext";
import { MemberDetail } from "../../types";
import LoadingSpinner from "../common/LoadingSpinner";
import SearchInput from "../common/SearchInput";

interface AlumniMembersListProps {
  onRefreshRequested?: (refreshFn: () => void) => void;
}

const AlumniMembersList = ({ onRefreshRequested }: AlumniMembersListProps) => {
  const [alumniMembers, setAlumniMembers] = useState<MemberDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { session } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchAlumniMembers();
    // Pass the refresh function to parent
    if (onRefreshRequested) {
      onRefreshRequested(fetchAlumniMembers);
    }
  }, [session]);

  const fetchAlumniMembers = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      const token = session.access_token;
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/member-info/alumni/summary`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch alumni members");
      }

      const data = await response.json();
      setAlumniMembers(data);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to load alumni members",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Filter members based on search query
  const filteredMembers = alumniMembers.filter(({ email, name }) => {
    const searchText = `${name} ${email}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <LoadingSpinner text="Loading alumni members..." size="md" />
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
          placeholder="Search alumni members..."
          containerClassName="flex-grow"
          inputClassName="px-3 py-2"
        />
      </div>

      {/* Members List */}
      <div className="w-full h-[300px] flex flex-col py-2 gap-2 overflow-y-scroll scrollbar-thumb-bapgray scrollbar-track-bapgraylight">
        {filteredMembers.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500 text-center">
              {searchQuery ? "No alumni members match your search" : "No alumni members"}
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.email}
              className="w-full border border-bapgray rounded-md px-4 py-2 flex justify-between items-center"
            >
              <span className="text-gray-800 text-m pr-2">
                {member.name ? member.name : member.email}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlumniMembersList;
