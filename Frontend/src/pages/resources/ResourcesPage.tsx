import React, { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/auth/authProvider";
import ResourceCategory from "../../components/resource/ResourceCategory";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useNavigate } from "react-router-dom";

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
}

const ResourcesPage: React.FC = () => {
  const { session, role } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Define navigation links based on authentication status
  const navLinks = [
    { name: "Network", href: "/network" },
    { name: "Events", href: "/events" },
    { name: "Dashboard", href: "/admin" },
  ];

  useEffect(() => {
    // If the user is a sponsor, redirect them back to the previous page or /auth/Home
    if (
      role === "sponsor" ||
      (typeof role === "object" && role !== null && "type" in role && role.type === "sponsor")
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

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Failed to load resources. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [session]);

  // If the user is a sponsor, don't render anything
  if (
    role === "sponsor" ||
    (typeof role === "object" && role !== null && "type" in role && role.type === "sponsor")
  ) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        links={navLinks}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        isLogged={Boolean(session)}
      />

      <main className="flex-grow p-8 pt-32 px-8 sm:px-16 lg:px-24">
        <h1 className="text-3xl font-bold mb-4 text-center">Resources</h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          This page contains helpful resources and materials for members to reference.
        </p>
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
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No resources available at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <ResourceCategory key={category.id} category={category} />
            ))}
          </div>
        )}
      </main>

      <Footer backgroundColor="#AF272F" />
    </div>
  );
};

export default ResourcesPage;