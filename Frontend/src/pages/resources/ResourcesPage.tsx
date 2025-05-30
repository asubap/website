import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/auth/authProvider";
import ResourceCategory from "../../components/resource/ResourceCategory";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { getNavLinks } from "../../components/nav/NavLink";
import SearchInput from "../../components/common/SearchInput";

// Define the interfaces for our data structure
interface Resource {
  id: string;
  category_id: string;
  name: string;
  description: string;
  file_key: string;
  mime_type: string;
  created_at: string;
  signed_url: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  resources: Resource[];
  resourceType: "firm" | "chapter";
}

// Define RawCategoryData for the fetched data structure
interface RawCategoryData {
  id: string;
  name: string;
  description: string;
  resource_type: "firm" | "chapter" | null; // Matching expected backend values
  resources: Resource[];
  // created_at is not present in RawCategoryData from the backend for categories
}

const ResourcesPage: React.FC = () => {
  const { session, role } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    // If the user is a sponsor, redirect them back to the previous page or /auth/Home
    if (
      role === "sponsor" ||
      (typeof role === "object" &&
        role !== null &&
        "type" in role &&
        role.type === "sponsor")
    ) {
      // Try to go back if possible, otherwise go to /auth/Home
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigate("/auth/Home", { replace: true });
      }
    }
  }, [role, navigate]);

  useEffect(() => {
    const fetchResources = async () => {
      if (!session?.access_token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/resources`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data: RawCategoryData[] = await response.json(); // Use defined type
        const mappedData = data.map((cat) => ({
          ...cat,
          resourceType: cat.resource_type || "firm", // Default to firm if null
          resources: cat.resources || [],
          created_at: new Date().toISOString(), // Add a placeholder created_at for now
        }));
        setCategories(mappedData);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Failed to load resources. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [session]);

  // Fuzzy search logic (same as admin page)
  const fuseOptions = {
    includeScore: true,
    threshold: 0.4,
    keys: [
      { name: "name", weight: 0.7 },
      { name: "description", weight: 0.3 },
      { name: "resourceType", weight: 0.2 },
      { name: "resources.name", weight: 0.7 },
      { name: "resources.description", weight: 0.5 },
    ],
  };
  const fuse = useMemo(() => new Fuse(categories, fuseOptions), [categories]);
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const results = fuse.search(searchQuery);
    return results.map((result) => ({ ...result.item })).filter(Boolean);
  }, [searchQuery, categories, fuse]);

  // Separate filtered categories by resourceType
  const filteredFirmCategories = filteredCategories.filter(
    (cat) => cat.resourceType === "firm"
  );
  const filteredChapterCategories = filteredCategories.filter(
    (cat) => cat.resourceType === "chapter"
  );

  // Auto-expand all filtered categories when searching, collapse all when cleared
  useEffect(() => {
    if (searchQuery.trim()) {
      // Expand all filtered categories
      setExpandedCategories(new Set(filteredCategories.map((cat) => cat.id)));
    } else {
      // Collapse all
      setExpandedCategories(new Set());
    }
  }, [searchQuery, filteredCategories]);

  // If the user is a sponsor, don't render anything
  if (
    role === "sponsor" ||
    (typeof role === "object" &&
      role !== null &&
      "type" in role &&
      role.type === "sponsor")
  ) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        links={getNavLinks(!!session)}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        isLogged={Boolean(session)}
      />

      <main className="flex-grow p-8 pt-32 px-8 sm:px-16 lg:px-24">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-sm text-gray-600 mt-1">
            This page contains helpful resources and materials for members to
            reference.
          </p>
        </div>
        {/* Search Bar */}
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories or resources..."
          containerClassName="mb-8"
          inputClassName="px-3 py-2"
        />
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner text="Loading resources..." size="lg" />
          </div>
        ) : error ? (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {filteredChapterCategories.length > 0 && (
              <>
                <h2 className="text-2xl font-semibold mb-2 text-center">
                  Chapter Resources
                </h2>
                <div className="space-y-6 mb-8">
                  {filteredChapterCategories.map((category) => (
                    <ResourceCategory
                      key={category.id}
                      category={category}
                      expanded={expandedCategories.has(category.id)}
                      onToggle={() => {
                        setExpandedCategories((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(category.id)) {
                            newSet.delete(category.id);
                          } else {
                            newSet.add(category.id);
                          }
                          return newSet;
                        });
                      }}
                    />
                  ))}
                </div>
              </>
            )}
            {filteredFirmCategories.length > 0 && (
              <>
                <h2 className="text-2xl font-semibold mb-2 text-center">
                  Firm Resources
                </h2>
                <div className="space-y-6">
                  {filteredFirmCategories.map((category) => (
                    <ResourceCategory
                      key={category.id}
                      category={category}
                      expanded={expandedCategories.has(category.id)}
                      onToggle={() => {
                        setExpandedCategories((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(category.id)) {
                            newSet.delete(category.id);
                          } else {
                            newSet.add(category.id);
                          }
                          return newSet;
                        });
                      }}
                    />
                  ))}
                </div>
              </>
            )}
            {filteredFirmCategories.length === 0 &&
              filteredChapterCategories.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <p>No resources available at this time.</p>
                </div>
              )}
          </>
        )}
      </main>

      <Footer backgroundColor="#AF272F" />
    </div>
  );
};

export default ResourcesPage;
