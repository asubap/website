import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../context/auth/authProvider";
import Fuse from "fuse.js";
import NetworkingLayout from "../../components/network/NetworkingLayout";
import { Sponsor } from "../../types";
import NetworkList from "../../components/network/NetworkList";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getNavLinks } from "../../components/nav/NavLink";
import SortDropdown from "../../components/common/SortDropdown";
import { useSort, sponsorSortFields } from "../../utils/sortUtils";

// Define interface for sponsor resources
interface SponsorResource {
  id?: number;
  label: string;
  url: string;
  uploadDate?: string;
}

// Define interface for backend sponsor data
interface BackendSponsor {
  id?: number;
  company_name?: string;
  about?: string;
  links?: string | null;
  pfp_url?: string;
  resources?: SponsorResource[];
  tier?: string;
  emails?: string[];
}

// Sort options for sponsors
const sponsorSortOptions = [
  { value: 'tier-desc', label: 'Tier (Highest First)' },
  { value: 'tier-asc', label: 'Tier (Lowest First)' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
];

const SponsorsNetworkPage = () => {
  const { session } = useAuth();
  const [allSponsors, setAllSponsors] = useState<Sponsor[]>([]);
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSponsorsLoading, setIsSponsorsLoading] = useState(true);
  const [sponsorsError, setSponsorsError] = useState<string | null>(null);

  // Use the custom sort hook
  const { sortBy, sortedData: sortedSponsors, handleSortChange } = useSort(
    filteredSponsors,
    'tier-desc',
    sponsorSortFields
  );

  // Fuse.js setup for sponsor search
  const fuseOptions = {
    includeScore: true,
    threshold: 0.3,
    keys: [
      { name: "name", weight: 0.8 },
      { name: "about", weight: 0.4 },
      { name: "tier", weight: 0.3 },
    ],
  };

  const fuse = useMemo(
    () => new Fuse(allSponsors, fuseOptions),
    [allSponsors]
  );

  useEffect(() => {
    const fetchSponsors = async () => {
      setIsSponsorsLoading(true);
      setSponsorsError(null);

      try {
        const token = session?.access_token;
        if (!token) {
          setSponsorsError("You must be logged in to view this page");
          setIsSponsorsLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/sponsors/summary`,
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
        // Transform summary data - resources and emails not included
        const transformedSponsors = data.map((item: BackendSponsor) => {
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
              parsedLinks = item.links
                .split(",")
                .map((link: string) => link.trim())
                .filter((link: string) => link !== "");
            }
          }

          return {
            id: item.id?.toString(),
            type: "sponsor" as const,
            name: item.company_name || "Unknown Sponsor",
            tier: item.tier,
            about: item.about || "No description available.",
            links: parsedLinks,
            photoUrl: item.pfp_url || "/placeholder-logo.png",
            resources: [], // Not in summary
            emails: [], // Not in summary
          };
        });
        setAllSponsors(transformedSponsors);
        setFilteredSponsors(transformedSponsors);
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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    let results = allSponsors;

    if (query.trim()) {
      try {
        const searchResults = fuse.search(query);
        results = searchResults.map((result) => result.item);
      } catch (error) {
        console.error("Error during fuse.search:", error);
        results = [];
      }
    }

    setFilteredSponsors(results);
  }, [fuse, allSponsors]);

  return (
    <NetworkingLayout navLinks={getNavLinks(!!session)}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-bapred mb-6 text-center">
          Our Sponsors
        </h1>

        {/* Search and Sort - Integrated */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search sponsors..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bapred transition-colors"
                />
              </div>
            </div>
            <div className="w-48">
              <SortDropdown
                options={sponsorSortOptions}
                value={sortBy}
                onChange={handleSortChange}
                label=""
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {isSponsorsLoading ? (
            <LoadingSpinner text="Loading sponsors..." />
          ) : sponsorsError ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              <p>{sponsorsError}</p>
            </div>
          ) : sortedSponsors.length > 0 ? (
            <NetworkList entities={sortedSponsors} />
          ) : (
            allSponsors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
                <p>No sponsors found matching your search criteria.</p>
              </div>
            )
          )}
        </div>
      </div>
    </NetworkingLayout>
  );
};

export default SponsorsNetworkPage;
