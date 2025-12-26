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
  user_id?: string;
  user_email?: string | null;
  development_hours?: number;
  professional_hours?: number;
  service_hours?: number;
  social_hours?: number;
  links?: string | null;
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
  first_name?: string;
  last_name?: string;
  bio?: string;
  internship?: string;
  year?: string;
  phone?: string;
  photo_url?: string;
}

// --- Transformation Functions ---
const transformBackendMemberToMember = (item: BackendMember): Member => {
  const memberName =
    item.name ||
    `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
    "Unknown Member";
  const memberLinks =
    typeof item.links === "string" && item.links.trim() !== ""
      ? item.links
          .split(",")
          .map((link: string) => link.trim())
          .filter((link: string) => link !== "")
      : [];
  const memberAbout = item.about || item.bio || "";
  const memberPhotoUrl = item.profile_photo_url || item.photo_url || "";

  // Map API rank to interface rank format
  const memberRank = item.rank === "inducted" ? "Inducted" :
                     item.rank === "alumni" ? "Alumni" :
                     item.rank === "pledge" ? "Pledge" :
                     "Inducted"; // default to Current

  return {
    id: item.id.toString(),
    type: "member",
    name: memberName,
    email: item.user_email || "Not Provided",
    phone: item.phone || "Not Provided",
    major: item.major || "Not Provided",
    graduationDate: item.graduating_year?.toString() || item.year || "Not Provided",
    status: item.member_status || "Not Specified",
    about: memberAbout,
    internship: item.internship || "Not Specified",
    photoUrl: memberPhotoUrl,
    hours: item.total_hours?.toString() ?? "0",
    developmentHours: item.development_hours?.toString() ?? "0",
    professionalHours: item.professional_hours?.toString() ?? "0",
    serviceHours: item.service_hours?.toString() ?? "0",
    socialHours: item.social_hours?.toString() ?? "0",
    links: memberLinks,
    rank: memberRank,
    role: item.role || "general-member",
    event_attendance: item.event_attendance || [],
  };
};

// Sort options for alumni (no rank sorting needed)
const alumniSortOptions = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'graduation-asc', label: 'Graduation Year (Earliest)' },
  { value: 'graduation-desc', label: 'Graduation Year (Latest)' },
  { value: 'major-asc', label: 'Major (A-Z)' },
  { value: 'major-desc', label: 'Major (Z-A)' },
  { value: 'status-asc', label: 'Status (A-Z)' },
  { value: 'status-desc', label: 'Status (Z-A)' },
  { value: 'hours-desc', label: 'Total Hours (High to Low)' },
  { value: 'hours-asc', label: 'Total Hours (Low to High)' },
  { value: 'email-asc', label: 'Email (A-Z)' },
  { value: 'email-desc', label: 'Email (Z-A)' },
];

const AlumniPage = () => {
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
    // For alumni page, only show employment status options (not rank-based)
    const memberStatuses = members
      .map(member => member.status)
      .filter(status => status && status !== "Not Specified")
      .sort();
    const uniqueMemberStatuses = [...new Set(memberStatuses)];

    // Add "Looking for Full-time" if not already present
    if (!uniqueMemberStatuses.includes("Looking for Full-time")) {
      uniqueMemberStatuses.push("Looking for Full-time");
    }

    return uniqueMemberStatuses;
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
          `${import.meta.env.VITE_BACKEND_URL}/member-info/`,
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

        // Use transformation function and filter for alumni only
        const transformedData = data
          .map(transformBackendMemberToMember)
          .filter((member: Member) => member.rank?.toLowerCase() === "alumni");

        setMembers(transformedData);
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembersError("Failed to load alumni. Please try again later.");
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
      // Filter by employment status only (all are already alumni)
      const statusMatch = !filters.status ||
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
          Our Alumni
        </h1>

        <NetworkSearch
          onSearch={handleSearch}
          availableGraduationYears={availableGraduationYears}
          availableMajors={availableMajors}
          availableStatuses={availableStatuses}
          sortOptions={alumniSortOptions}
          sortValue={sortBy}
          onSortChange={handleSortChange}
        />

        <div className="mt-6">
          {isMembersLoading ? (
            <LoadingSpinner text="Loading alumni..." />
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
                  No alumni found matching your search criteria.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </NetworkingLayout>
  );
};

export default AlumniPage;
