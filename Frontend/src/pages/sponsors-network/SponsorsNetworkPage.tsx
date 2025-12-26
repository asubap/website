import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../context/auth/authProvider";
import Fuse from "fuse.js";
import NetworkingLayout from "../../components/network/NetworkingLayout";
import { Sponsor } from "../../types";
import NetworkList from "../../components/network/NetworkList";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getNavLinks } from "../../components/nav/NavLink";

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
    resources: item.resources?.map((r) => ({
      label: r.label || "Resource",
      url: r.url || ""
    })) || [],
    emails: item.emails || [],
  };
};

const SponsorsNetworkPage = () => {
  const { session } = useAuth();
  const [allSponsors, setAllSponsors] = useState<Sponsor[]>([]);
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSponsorsLoading, setIsSponsorsLoading] = useState(true);
  const [sponsorsError, setSponsorsError] = useState<string | null>(null);

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
        const transformedSponsors = data.map(transformBackendSponsorToSponsor);
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

    if (query.trim()) {
      try {
        const searchResults = fuse.search(query);
        setFilteredSponsors(searchResults.map((result) => result.item));
      } catch (error) {
        console.error("Error during fuse.search:", error);
        setFilteredSponsors([]);
      }
    } else {
      setFilteredSponsors(allSponsors);
    }
  }, [fuse, allSponsors]);

  return (
    <NetworkingLayout navLinks={getNavLinks(!!session)}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-bapred mb-6 text-center">
          Our Sponsors
        </h1>

        {/* Simple search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search sponsors..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bapred focus:border-transparent"
          />
        </div>

        <div className="mt-6">
          {isSponsorsLoading ? (
            <LoadingSpinner text="Loading sponsors..." />
          ) : sponsorsError ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              <p>{sponsorsError}</p>
            </div>
          ) : filteredSponsors.length > 0 ? (
            <NetworkList entities={filteredSponsors} />
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
