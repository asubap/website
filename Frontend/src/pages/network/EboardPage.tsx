import { useEffect, useMemo, useState, useCallback } from "react";
import Fuse from "fuse.js";
import { useAuth } from "../../context/auth/authProvider";
import type { EboardFacultyEntry, MemberDetail } from "../../types";
import NetworkingLayout from "../../components/network/NetworkingLayout";
import NetworkSearch from "../../components/network/NetworkSearch";
import NetworkList from "../../components/network/NetworkList";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getNavLinks } from "../../components/nav/NavLink";
import { useSort, memberSortFields } from "../../utils/sortUtils";

const eboardSortOptions = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "major-asc", label: "Major (A-Z)" },
  { value: "major-desc", label: "Major (Z-A)" },
  { value: "email-asc", label: "Email (A-Z)" },
  { value: "email-desc", label: "Email (Z-A)" },
];

type BackendMemberSummary = {
  id: number;
  user_email?: string | null;
  display_email?: string | null;
  name?: string | null;
  major?: string | null;
  about?: string | null;
  graduating_year?: string | null;
  profile_photo_url?: string | null;
  total_hours?: number | null;
  rank?: string | null;
  member_status?: string | null;
  first_link?: string | null;
  role?: string | null;
};

const formatRank = (rank?: string | null) => {
  if (rank === "inducted") return "Inducted";
  if (rank === "pledge") return "Pledge";
  if (rank === "alumni") return "Alumni";
  return "Inducted";
};

const mapEboardEntryToMember = (
  entry: EboardFacultyEntry,
  index: number,
  memberSummary?: BackendMemberSummary
): MemberDetail => ({
  id: `eboard-${index}-${entry.role}`,
  type: "member",
  name: entry.name || memberSummary?.name || entry.role || "Unknown Member",
  email: entry.display_email || entry.role_email || entry.email || "Not Provided",
  userEmail: entry.email || undefined,
  phone: "Not Provided",
  major: memberSummary?.major || entry.major || "Not Provided",
  graduationDate: memberSummary?.graduating_year?.toString() || "Not Provided",
  status: memberSummary?.member_status || "Not Specified",
  about: memberSummary?.about || entry.role || "No description provided.",
  internship: "Not Specified",
  photoUrl: entry.profile_photo_url || memberSummary?.profile_photo_url || "",
  hours: memberSummary?.total_hours?.toString() ?? "0",
  developmentHours: "0",
  professionalHours: "0",
  serviceHours: "0",
  socialHours: "0",
  links: memberSummary?.first_link ? [memberSummary.first_link] : [],
  rank: formatRank(memberSummary?.rank),
  role: memberSummary?.role || entry.role || "e-board",
  event_attendance: [],
});

const EboardPage = () => {
  const { session } = useAuth();
  const [members, setMembers] = useState<MemberDetail[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sortBy, sortedData: sortedMembers, handleSortChange } = useSort(
    filteredMembers,
    "name-asc",
    memberSortFields
  );

  const fuse = useMemo(
    () =>
      new Fuse(members, {
        includeScore: true,
        threshold: 0.3,
        keys: [
          { name: "name", weight: 0.8 },
          { name: "email", weight: 0.6 },
          { name: "major", weight: 0.5 },
          { name: "about", weight: 0.4 },
        ],
      }),
    [members]
  );

  useEffect(() => {
    const fetchEboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = session?.access_token;
        if (!token) {
          setError("You must be logged in to view this page");
          return;
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [eboardResponse, activeResponse, alumniResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/eboard`, {
            method: "GET",
            headers,
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/member-info/active/summary`, {
            method: "GET",
            headers,
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/member-info/alumni/summary`, {
            method: "GET",
            headers,
          }),
        ]);

        if (!eboardResponse.ok) {
          throw new Error(`Error fetching e-board members: ${eboardResponse.statusText}`);
        }

        const eboardData: EboardFacultyEntry[] = await eboardResponse.json();
        const activeMembers: BackendMemberSummary[] = activeResponse.ok ? await activeResponse.json() : [];
        const alumniMembers: BackendMemberSummary[] = alumniResponse.ok ? await alumniResponse.json() : [];

        const memberSummaryByEmail = new Map<string, BackendMemberSummary>();
        [...activeMembers, ...alumniMembers].forEach((member) => {
          if (member.user_email) {
            memberSummaryByEmail.set(member.user_email, member);
          }
        });

        setMembers(
          eboardData.map((entry, index) =>
            mapEboardEntryToMember(entry, index, entry.email ? memberSummaryByEmail.get(entry.email) : undefined)
          )
        );
      } catch (fetchError) {
        console.error("Error fetching e-board members:", fetchError);
        setError("Failed to load e-board members. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEboard();
  }, [session]);

  useEffect(() => {
    if (!isLoading) {
      setFilteredMembers(members);
    }
  }, [isLoading, members]);

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFilteredMembers(members);
        return;
      }

      try {
        const searchResults = fuse.search(query);
        setFilteredMembers(searchResults.map((result) => result.item));
      } catch (searchError) {
        console.error("Error during e-board search:", searchError);
        setFilteredMembers([]);
      }
    },
    [fuse, members]
  );

  return (
    <NetworkingLayout navLinks={getNavLinks(!!session)}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-bapred mb-6 text-center">
          Our Eboard
        </h1>

        <NetworkSearch
          onSearch={handleSearch}
          availableGraduationYears={[]}
          availableMajors={[]}
          availableStatuses={[]}
          sortOptions={eboardSortOptions}
          sortValue={sortBy}
          onSortChange={handleSortChange}
        />

        <div className="mt-6">
          {isLoading ? (
            <LoadingSpinner text="Loading e-board members..." />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              <p>{error}</p>
            </div>
          ) : sortedMembers.length > 0 ? (
            <NetworkList entities={sortedMembers} />
          ) : (
            members.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
                <p>No e-board members found matching your search criteria.</p>
              </div>
            )
          )}
        </div>
      </div>
    </NetworkingLayout>
  );
};

export default EboardPage;
