import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth/authProvider";
import MemberSearch from "../../components/networking/MemberSearch";

import NetworkingLayout from "../../components/networking/NetworkingLayout";
import { Member } from "../../types";
import MemberList from "../../components/networking/MemberList";

interface Filters {
  graduationYear: string;
  major: string;
  status: string;
}

// Define the structure of the member data from the backend
interface BackendMember {
  user_id: string;
  user_email?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  internship?: string;
  year?: string;
  major?: string;
  phone?: string;
  photo_url?: string;
}

const NetworkingPage = () => {
  const { session } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch members from backend API using the authentication token
        const token = session?.access_token;

        if (!token) {
          setError("You must be logged in to view this page");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          "https://asubap-backend.vercel.app/member-info/",
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

        // Transform the backend data to match our Member type
        const transformedData = data.map((item: BackendMember) => ({
          id: item.user_id,
          name: `${item.first_name || ""} ${item.last_name || ""}`.trim(),
          email: item.user_email || "",
          phone: item.phone || "",
          major: item.major || "",
          graduationDate: item.year || "",
          status: "Active", // Default status since it's not provided by the API
          about: item.bio || "",
          internship: item.internship || "",
          photoUrl: item.photo_url || "",
          hours: "", // Not provided by the API
        }));

        setMembers(transformedData);
        setFilteredMembers(transformedData);
      } catch (error) {
        console.error("Error fetching members:", error);
        setError("Failed to load members. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [session]);

  const handleSearch = (query: string, filters: Filters) => {
    if (!query && Object.keys(filters).length === 0) {
      setFilteredMembers(members);
      return;
    }

    let results = [...members];

    // Apply text search if query exists
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm) ||
          member.major.toLowerCase().includes(searchTerm) ||
          member.email.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters if they exist
    if (filters.graduationYear) {
      results = results.filter((member) =>
        member.graduationDate.includes(filters.graduationYear)
      );
    }

    if (filters.major) {
      results = results.filter((member) =>
        member.major.toLowerCase().includes(filters.major.toLowerCase())
      );
    }

    if (filters.status) {
      results = results.filter((member) => member.status === filters.status);
    }

    setFilteredMembers(results);
  };

  return (
    <NetworkingLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Member Network</h1>

        <MemberSearch onSearch={handleSearch} />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading members...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
            <p>{error}</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mt-4">
            <p>No members found matching your search criteria.</p>
          </div>
        ) : (
          <MemberList members={filteredMembers} />
        )}
      </div>
    </NetworkingLayout>
  );
};

export default NetworkingPage;
