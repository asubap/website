import Navbar from "../../components/layout/Navbar";
import { useState, useEffect } from "react";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/auth/authProvider";
import { supabase } from "../../context/auth/supabaseClient";
import MemberDescription from "../../components/member/MemberDescription";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Add environment variable for backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MemberView = () => {
  const { session, role } = useAuth();
  const email = session?.user?.email || "";
  const navLinks = [
    { name: "Network", href: "/network" },
    { name: "Events", href: "/events" },
    { name: "Dashboard", href: "/admin" },
  ];

  const [sponsorProfileUrl] = useState(
    "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
  );
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userDetails, setUserDetails] = useState<{
    user_id: string;
    user_email: string;
    bio: string;
    internship: string;
    first_name: string;
    last_name: string;
    year: string;
    major: string;
    contact_me: string;
    hours: string;
  }>({
    user_id: "",
    user_email: "",
    bio: "",
    internship: "",
    first_name: "",
    last_name: "",
    year: "",
    major: "",
    contact_me: "",
    hours: "",
  });

  // const [photoLoading, setPhotoLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          // Fetch user role
          const token = session.access_token;
          const response = await fetch(`${BACKEND_URL}/member-info/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_email: session.user.email,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user details");
          }

          const data = await response.json();

          if (data && data.length > 0) {
            setUserDetails(data[0]);
            // Set profile photo URL if available
            if (data[0].profile_photo_url) {
              setProfilePhotoUrl(data[0].profile_photo_url);
            }
          } else {
            setError("No user details found");
          }
        }
      } catch (error) {
        console.error("Error fetching member info:", error);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        links={navLinks}
        isLogged={!!session}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        role={role}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner text="Loading user information..." size="md" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <MemberDescription
            profileUrl={profilePhotoUrl || sponsorProfileUrl}
            name={userDetails.first_name || "N/A"}
            major={userDetails.major || "N/A"}
            email={email}
            phone={userDetails.contact_me || "N/A"}
            status={"Not-Grad"}
            hours={userDetails.hours || "0"}
            year={userDetails.year || "N/A"}
            internship={userDetails.internship || "N/A"}
            description={userDetails.bio || "No bio available"}
          />
        </>
      )}

      <Footer backgroundColor="#AF272F" />
    </div>
  );
};

export default MemberView;
