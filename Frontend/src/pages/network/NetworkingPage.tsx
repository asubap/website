import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/auth/authProvider";
import NetworkSearch from "../../components/network/NetworkSearch";
import Fuse from "fuse.js";

import NetworkingLayout from "../../components/network/NetworkingLayout";
import { MemberDetail as Member, Sponsor } from "../../types";
import NetworkList from "../../components/network/NetworkList";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getNavLinks } from "../../components/nav/NavLink";

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
  name?: string | null;
  major?: string | null;
  about?: string | null;
  graduating_year?: string | null;
  profile_photo_url?: string | null;
  total_hours?: number;
  role?: string | null;
  rank?: string | null;
  member_status?: string;
  // Add potential fallback fields from previous structure if needed
  first_name?: string;
  last_name?: string;
  bio?: string;
  internship?: string;
  year?: string;
  phone?: string;
  photo_url?: string;
}

// Define interface for sponsor resources
interface SponsorResource {
  id?: number;
  label?: string;
  url?: string;
  uploadDate?: string;
}

// Define interface for backend sponsor data
interface BackendSponsor {
  id?: number;
  company_name?: string;
  about?: string;
  links?: string | null;
  pfp_url?: string;
  resources?: SponsorResource[]; // Properly typed resources array
  tier?: string;
  emails?: string[];
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
  const memberRank = item.rank === "current" ? "Current" : 
                     item.rank === "alumni" ? "Alumni" : 
                     "Current"; // default to Current

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
  };
};

const transformBackendSponsorToSponsor = (item: BackendSponsor): Sponsor => {
  let parsedLinks: string[] = [];
  if (Array.isArray(item.links)) {
    parsedLinks = item.links.filter(
      (link) => typeof link === "string" && link.trim() !== ""
    );
  } else if (typeof item.links === "string" && item.links.trim() !== "") {
    try {
      const parsed = JSON.parse(item.links);
      if (Array.isArray(parsed)) {
        parsedLinks = parsed.filter(
          (link) => typeof link === "string" && link.trim() !== ""
        );
      } else {
        parsedLinks = item.links
          .split(",")
          .map((link: string) => link.trim())
          .filter((link: string) => link !== "");
      }
    } catch (e) {
      // Log the error and assume comma-separated
      console.warn(
        "JSON parsing of sponsor links failed, falling back to comma split:",
        e
      );
      parsedLinks = item.links
        .split(",")
        .map((link: string) => link.trim())
        .filter((link: string) => link !== "");
    }
  }

  return {
    id: item.id?.toString(),
    type: "sponsor",
    name: item.company_name || "Unknown Sponsor",
    tier: item.tier,
    about: item.about || "No description available.",
    links: parsedLinks,
    photoUrl: item.pfp_url || "/placeholder-logo.png",
    resources: item.resources?.map((r) => r.url || "") || [],
    emails: item.emails || [],
  };
};

const NetworkingPage = () => {
  const { session } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [allSponsors, setAllSponsors] = useState<Sponsor[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<
    (Member | Sponsor)[]
  >([]);

  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [isSponsorsLoading, setIsSponsorsLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [sponsorsError, setSponsorsError] = useState<string | null>(null);

  // Combine members and sponsors for unified search and filtering
  const networkEntities = useMemo(
    () => [...members, ...allSponsors],
    [members, allSponsors]
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
    // Fixed status options for rank-based filtering
    const rankStatuses = ["Current", "Pledge", "Alumni"];
    
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

  // Ensure Fuse instance depends on the memoized networkEntities
  const fuse = useMemo(
    () => new Fuse(networkEntities, fuseOptions),
    [networkEntities]
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

        // Use transformation function
        const transformedData = data.map(transformBackendMemberToMember);
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

  useEffect(() => {
    const fetchSponsors = async () => {
      setIsSponsorsLoading(true);
      setSponsorsError(null);

      try {
        const token = session?.access_token;
        if (!token) {
          setIsSponsorsLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/sponsors/get-all-sponsor-info`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching sponsors: ${response.statusText}`);
        }

        const data = await response.json();

        // Use transformation function
        const transformedSponsors = data.map(transformBackendSponsorToSponsor);
        setAllSponsors(transformedSponsors);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
        setSponsorsError("Failed to load sponsors. Please try again later.");
      } finally {
        setIsSponsorsLoading(false);
      }
    };

    if (session?.access_token) {
      fetchSponsors();
    }
  }, [session]);

  // Effect to set initial filtered list when data loads
  useEffect(() => {
    if (!isMembersLoading && !isSponsorsLoading) {
      setFilteredEntities(networkEntities); // Use the memoized value
    }
  }, [isMembersLoading, isSponsorsLoading, networkEntities]);

  const handleSearch = (query: string, filters: Filters) => {
    let results = networkEntities; // Start with combined list

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

    // 2. Apply Filters (on top of fuzzy search results or all entities)
    const filteredResults = results.filter((entity) => {
      const isMember = (entity: Member | Sponsor): entity is Member =>
        entity.type === "member";

      if (isMember(entity)) {
        // Member filtering logic
        const yearMatch =
          !filters.graduationYear ||
          entity.graduationDate === filters.graduationYear;
        const majorMatch = !filters.major || entity.major === filters.major;
        // Filter by status: handle both rank-based statuses and member_status values
        const statusMatch = !filters.status || 
          (filters.status === "Current" && entity.rank === "Current") ||
          (filters.status === "Alumni" && entity.rank === "Alumni") ||
          (filters.status === "Pledge" && entity.rank === "Pledge") ||
          (filters.status === "Looking for Internship" && entity.status === "Looking for Internship") ||
          (filters.status === "Looking for Full-time" && entity.status === "Looking for Full-time") ||
          (filters.status === "Not Looking" && entity.status === "Not Looking");
        return yearMatch && majorMatch && statusMatch;
      } else {
        // Sponsor filtering logic: only show sponsors when no member-specific filters are applied
        const hasMemberSpecificFilters = filters.graduationYear || filters.major || filters.status;
        return !hasMemberSpecificFilters; // Hide sponsors if any member-specific filters are active
      }
    });

    setFilteredEntities(filteredResults);
  };

  return (
    <NetworkingLayout navLinks={getNavLinks(!!session)}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-bapred mb-6 text-center">
          Network
        </h1>

        <NetworkSearch 
          onSearch={handleSearch}
          availableGraduationYears={availableGraduationYears}
          availableMajors={availableMajors}
          availableStatuses={availableStatuses}
        />

        <div className="mt-6">
          {isMembersLoading || isSponsorsLoading ? (
            <LoadingSpinner text="Loading network..." />
          ) : membersError || sponsorsError ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              <p>{membersError || sponsorsError}</p>
            </div>
          ) : filteredEntities.length > 0 ? (
            <NetworkList entities={filteredEntities} />
          ) : (
            (members.length > 0 || allSponsors.length > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
                <p>
                  No members or sponsors found matching your search criteria.
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
