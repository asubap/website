import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../context/auth/authProvider";
import NetworkSearch from "../../components/network/NetworkSearch";
import Fuse from "fuse.js";

import NetworkingLayout from "../../components/network/NetworkingLayout";
import { MemberDetail as Member } from "../../types";
import NetworkList from "../../components/network/NetworkList";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getNavLinks } from "../../components/nav/NavLink";
import { useSort, memberSortFields } from "../../utils/sortUtils";

interface Filters {
  graduationYear: string;
  major: string;
  status: string;
}

// Updated BackendMember interface based on user query
interface BackendMember {
  id: number;
  user_id?: string; // Keep if still used?
  user_email?: string | null;
  development_hours?: number;
  professional_hours?: number;
  service_hours?: number;
  social_hours?: number;
  links?: string | null;
  first_link?: string | null; // For summary endpoint
  name?: string | null;
  major?: string | null;
  about?: string | null;
  graduating_year?: string | null;
  profile_photo_url?: string | null;
  total_hours?: number;
  role?: string | null;
  rank?: string | null;
  member_status?: string;
  event_attendance?: any[];
  // Add potential fallback fields from previous structure if needed
  first_name?: string;
  last_name?: string;
  bio?: string;
  internship?: string;
  year?: string;
  phone?: string;
  photo_url?: string;
}

// Sort options for members
const memberSortOptions = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'graduation-asc', label: 'Graduation Year (Earliest)' },
  { value: 'graduation-desc', label: 'Graduation Year (Latest)' },
  { value: 'major-asc', label: 'Major (A-Z)' },
  { value: 'major-desc', label: 'Major (Z-A)' },
  { value: 'rank-asc', label: 'Rank (Current First)' },
  { value: 'rank-desc', label: 'Rank (Alumni First)' },
  { value: 'status-asc', label: 'Status (A-Z)' },
  { value: 'status-desc', label: 'Status (Z-A)' },
  { value: 'hours-desc', label: 'Total Hours (High to Low)' },
  { value: 'hours-asc', label: 'Total Hours (Low to High)' },
  { value: 'email-asc', label: 'Email (A-Z)' },
  { value: 'email-desc', label: 'Email (Z-A)' },
];

const NetworkingPage = () => {
  const { session } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  // Use the custom sort hook
  const { sortBy, sortedData: sortedMembers, handleSortChange } = useSort(
    filteredMembers,
    'name-asc',
    memberSortFields
  );

  // Generate dynamic filter options from members data
  const availableGraduationYears = useMemo(() => {
    const years = members
      .map(member => member.graduationDate)
      .filter(year => year && year !== "Not Provided")
      .sort();
    return [...new Set(years)]; // Remove duplicates
  }, [members]);

  const availableMajors = useMemo(() => {
    const majors = members
      .map(member => member.major)
      .filter(major => major && major !== "Not Provided")
      .sort();
    return [...new Set(majors)]; // Remove duplicates
  }, [members]);

  const availableStatuses = useMemo(() => {
    // Fixed status options for rank-based filtering (excluding Alumni since they're filtered out)
    const rankStatuses = ["Inducted", "Pledge"];

    // Dynamic member status options from actual data
    const memberStatuses = members
      .map(member => member.status)
      .filter(status => status && status !== "Not Specified")
      .sort();
    const uniqueMemberStatuses = [...new Set(memberStatuses)];

    // Add "Looking for Full-time" if not already present
    if (!uniqueMemberStatuses.includes("Looking for Full-time")) {
      uniqueMemberStatuses.push("Looking for Full-time");
    }

    // Combine and return all status options
    return [...rankStatuses, ...uniqueMemberStatuses];
  }, [members]);

  // Fuse.js setup
  const fuseOptions = {
    includeScore: true,
    threshold: 0.3, // Lowered threshold from 0.4 for less strict matching
    keys: [
      // Shared keys
      { name: "name", weight: 0.8 },
      { name: "about", weight: 0.4 },
      // Member specific
      { name: "email", weight: 0.6 },
      { name: "major", weight: 0.5 },
      { name: "role", weight: 0.5 }, // Also used for status
      { name: "graduationDate", weight: 0.3 },
      { name: "hours", weight: 0.2 }, // Add hours field
      { name: "links", weight: 0.2 }, // Add links field
      // add others if needed
    ],
  };

  // Ensure Fuse instance depends on members
  const fuse = useMemo(
    () => new Fuse(members, fuseOptions),
    [members]
  );

  useEffect(() => {
    const fetchMembers = async () => {
      setIsMembersLoading(true);
      setMembersError(null);

      try {
        // Fetch members from backend API using the authentication token
        const token = session?.access_token;

        if (!token) {
          setMembersError("You must be logged in to view this page");
          setIsMembersLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/member-info/active/summary`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching members: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform summary data - some fields not loaded initially
        const transformedData = data.map((item: BackendMember) => {
          const memberName =
            item.name ||
            `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
            "Unknown Member";
          const memberAbout = item.about || item.bio || "";
          const memberPhotoUrl = item.profile_photo_url || item.photo_url || "";
          const memberRank = item.rank === "inducted" ? "Inducted" :
                             item.rank === "alumni" ? "Alumni" :
                             item.rank === "pledge" ? "Pledge" :
                             "Inducted";

          return {
            id: item.id.toString(),
            type: "member" as const,
            name: memberName,
            email: item.user_email || "Not Provided",
            phone: "Not Provided", // Not in summary
            major: item.major || "Not Provided",
            graduationDate: item.graduating_year?.toString() || item.year || "Not Provided",
            status: item.member_status || "Not Specified",
            about: memberAbout,
            internship: "Not Specified", // Not in summary
            photoUrl: memberPhotoUrl,
            hours: item.total_hours?.toString() ?? "0",
            developmentHours: "0", // Not in summary
            professionalHours: "0", // Not in summary
            serviceHours: "0", // Not in summary
            socialHours: "0", // Not in summary
            links: item.first_link ? [item.first_link] : [],
            rank: memberRank,
            role: item.role || "general-member",
            event_attendance: [],
          };
        });
        setMembers(transformedData);
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembersError("Failed to load members. Please try again later.");
      } finally {
        setIsMembersLoading(false);
      }
    };

    fetchMembers();
  }, [session]);

  // Effect to set initial filtered list when data loads
  useEffect(() => {
    if (!isMembersLoading) {
      setFilteredMembers(members);
    }
  }, [isMembersLoading, members]);

  const handleSearch = useCallback((query: string, filters: Filters) => {
    let results = members; // Start with members list

    // 1. Apply Fuzzy Search (if query exists)
    if (query.trim()) {
      try {
        const searchResults = fuse.search(query);
        results = searchResults.map((result) => result.item);
      } catch (error) {
        console.error("Error during fuse.search:", error);
        results = [];
      }
    }

    // 2. Apply Filters (on top of fuzzy search results or all members)
    const filteredResults = results.filter((member) => {
      const yearMatch =
        !filters.graduationYear ||
        member.graduationDate === filters.graduationYear;
      const majorMatch = !filters.major || member.major === filters.major;
      // Filter by status: handle both rank-based statuses and member_status values
      const statusMatch = !filters.status ||
        (filters.status === "Inducted" && member.rank === "Inducted") ||
        (filters.status === "Alumni" && member.rank === "Alumni") ||
        (filters.status === "Pledge" && member.rank === "Pledge") ||
        (filters.status === "Looking for Internship" && member.status === "Looking for Internship") ||
        (filters.status === "Looking for Full-time" && member.status === "Looking for Full-time") ||
        (filters.status === "Not Looking" && member.status === "Not Looking");
      return yearMatch && majorMatch && statusMatch;
    });

    setFilteredMembers(filteredResults);
  }, [fuse, members]);

  return (
    <NetworkingLayout navLinks={getNavLinks(!!session)}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-bapred mb-6 text-center">
          Our Members
        </h1>

        <NetworkSearch
          onSearch={handleSearch}
          availableGraduationYears={availableGraduationYears}
          availableMajors={availableMajors}
          availableStatuses={availableStatuses}
          sortOptions={memberSortOptions}
          sortValue={sortBy}
          onSortChange={handleSortChange}
        />

        <div className="mt-6">
          {isMembersLoading ? (
            <LoadingSpinner text="Loading members..." />
          ) : membersError ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              <p>{membersError}</p>
            </div>
          ) : sortedMembers.length > 0 ? (
            <NetworkList entities={sortedMembers} />
          ) : (
            members.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
                <p>
                  No members found matching your search criteria.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </NetworkingLayout>
  );
};

export default NetworkingPage;
