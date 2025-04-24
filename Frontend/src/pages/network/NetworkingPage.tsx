import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth/authProvider";
import NetworkSearch from "../../components/network/NetworkSearch";

import NetworkingLayout from "../../components/network/NetworkingLayout";
import { Member, Sponsor } from "../../types";
import NetworkList from "../../components/network/NetworkList";
import LoadingSpinner from "../../components/common/LoadingSpinner";

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
}

const NetworkingPage = () => {
  const { session } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [allSponsors, setAllSponsors] = useState<Sponsor[]>([]);
  const [networkEntities, setNetworkEntities] = useState<(Member | Sponsor)[]>(
    []
  );
  const [filteredEntities, setFilteredEntities] = useState<
    (Member | Sponsor)[]
  >([]);

  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [isSponsorsLoading, setIsSponsorsLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [sponsorsError, setSponsorsError] = useState<string | null>(null);

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

        // Transform member data based on new structure provided by user
        const transformedData = data.map((item: BackendMember): Member => {
          // Determine name (prefer 'name', fallback to first/last)
          const memberName =
            item.name ||
            `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
            "Unknown Member";
          // Parse links string safely
          const memberLinks =
            typeof item.links === "string" && item.links.trim() !== ""
              ? item.links
                  .split(",")
                  .map((link: string) => link.trim())
                  .filter((link: string) => link !== "")
              : [];
          // Determine about (prefer 'about', fallback to 'bio')
          const memberAbout = item.about || item.bio || "";
          // Determine photoUrl (prefer 'profile_photo_url', fallback to 'photo_url')
          const memberPhotoUrl = item.profile_photo_url || item.photo_url || "";

          return {
            id: item.id.toString(), // Use the primary id
            type: "member",
            name: memberName,
            email: item.user_email || "Not Provided",
            hours: item.total_hours?.toString() ?? "0", // Use total_hours, default to "0"
            links: memberLinks, // Parsed links array
            major: item.major || "Not Provided",
            about: memberAbout, // Use combined about/bio
            graduationDate: item.graduating_year || item.year || "Not Provided", // Use graduating_year or year
            role: item.role || "Not Provided", // Use role
            photoUrl: memberPhotoUrl, // Use combined photo url
            // Default/unused fields from Member type
            phone: item.phone || "",
            status: item.role || "Not Provided", // Can also use role for status
            internship: item.internship || "",
          };
        });

        setMembers(transformedData);
        setFilteredEntities(transformedData);
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

        // Transform sponsor data according to the API response structure
        const transformedSponsors = data.map(
          (item: BackendSponsor): Sponsor => {
            // Better handling for links that could be array, string, or null
            let parsedLinks: string[] = [];

            // Add debug logging to see what we're getting
            console.log(
              "Original links data for",
              item.company_name,
              ":",
              item.links
            );

            if (Array.isArray(item.links)) {
              // If links is already an array, use it directly
              parsedLinks = item.links.filter(
                (link) => typeof link === "string" && link.trim() !== ""
              );
            } else if (
              typeof item.links === "string" &&
              item.links.trim() !== ""
            ) {
              // If links is a string, try to parse it
              try {
                // First try to parse as JSON, in case it's a stringified array
                const parsed = JSON.parse(item.links);
                if (Array.isArray(parsed)) {
                  parsedLinks = parsed.filter(
                    (link) => typeof link === "string" && link.trim() !== ""
                  );
                } else {
                  // If it's not an array, fall back to comma splitting
                  parsedLinks = item.links
                    .split(",")
                    .map((link: string) => link.trim())
                    .filter((link: string) => link !== "");
                }
              } catch (e) {
                // If JSON parsing fails, it's likely a comma-separated string
                console.log(
                  "JSON parsing failed, treating as comma-separated string:",
                  e
                );
                parsedLinks = item.links
                  .split(",")
                  .map((link: string) => link.trim())
                  .filter((link: string) => link !== "");
              }
            }

            // Log the parsed links for debugging
            console.log(
              "Parsed links for",
              item.company_name,
              ":",
              parsedLinks
            );

            return {
              id: item.id?.toString(), // Convert number id to string if present
              type: "sponsor",
              name: item.company_name || "Unknown Sponsor", // Use company_name
              about: item.about || "No description available.", // Use about, provide fallback
              links: parsedLinks, // Use parsed links
              photoUrl: item.pfp_url || "/placeholder-logo.png", // Use pfp_url, provide fallback
              resources: item.resources
                ? item.resources.map((r) => r.url || "")
                : [], // Convert resource objects to strings (URLs)
            };
          }
        );

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

  useEffect(() => {
    if (!isMembersLoading && !isSponsorsLoading) {
      const combined = [...members, ...allSponsors];
      setNetworkEntities(combined);
      setFilteredEntities(combined);
    }
  }, [members, allSponsors, isMembersLoading, isSponsorsLoading]);

  const handleSearch = (query: string, filters: Filters) => {
    if (!query && Object.values(filters).every((val) => !val)) {
      setFilteredEntities(networkEntities);
      return;
    }

    let results = [...networkEntities];

    // Apply text search if query exists - Check common field 'name'
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter((entity) =>
        entity.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters - Type guard to ensure we only filter members
    const isMember = (entity: Member | Sponsor): entity is Member =>
      entity.type === "member";

    if (filters.graduationYear) {
      results = results.filter(
        (entity) =>
          isMember(entity) &&
          entity.graduationDate.includes(filters.graduationYear)
      );
    }

    if (filters.major) {
      results = results.filter(
        (entity) =>
          isMember(entity) &&
          entity.major.toLowerCase().includes(filters.major.toLowerCase())
      );
    }

    if (filters.status) {
      results = results.filter(
        (entity) => isMember(entity) && entity.status === filters.status
      );
    }

    setFilteredEntities(results);
  };

  return (
    <NetworkingLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Network</h1>

        <NetworkSearch onSearch={handleSearch} />

        {/* Combined Loading State */}
        {isMembersLoading || isSponsorsLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner text="Loading network..." size="md" />
          </div>
        ) : /* Combined Error State */
        membersError || sponsorsError ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
            <p>{membersError || sponsorsError}</p>
          </div>
        ) : /* No Results State */
        filteredEntities.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mt-4">
            <p>No members or sponsors found matching your search criteria.</p>
          </div>
        ) : (
          /* Display List */
          <NetworkList entities={filteredEntities} />
        )}
      </div>
    </NetworkingLayout>
  );
};

export default NetworkingPage;
