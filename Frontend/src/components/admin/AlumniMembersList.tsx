import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth/authProvider";
import { useToast } from "../../context/toast/ToastContext";
import { MemberDetail } from "../../types";
import LoadingSpinner from "../common/LoadingSpinner";
import SearchInput from "../common/SearchInput";
import { GraduationCap } from "lucide-react";

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
  const filteredMembers = alumniMembers.filter(({ email, name, major }) => {
    const searchText = `${name} ${email} ${major || ""}`.toLowerCase();
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
              className="w-full border border-bapgray rounded-md px-4 py-2 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {member.photoUrl && (
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={member.photoUrl}
                      alt={`${member.name}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="text-gray-800 text-m font-medium">
                    {member.name}
                  </span>
                  {member.major && (
                    <span className="text-xs ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {member.major}
                    </span>
                  )}
                  {member.graduationDate && (
                    <div className="text-xs text-gray-600 flex items-center mt-1">
                      <GraduationCap size={12} className="mr-1" />
                      Class of {member.graduationDate}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {member.email}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlumniMembersList;
