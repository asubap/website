import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import SponsorDescription from "../../components/sponsor/SponsorDescription";
import axios from "axios";
import { useAuth } from "../../context/auth/authProvider";
import {} from "lucide-react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ProfileEditModal from "../../components/sponsor/ProfileEditModal";
import ResourceUploadForm from "../../components/sponsor/ResourceUploadForm";
import ResourceList from "../../components/sponsor/ResourceList";
import ResourcePreviewModal from "../../components/ui/ResourcePreviewModal";

// Define Resource type consistently
interface SponsorResource {
  id?: number | string;
  label: string;
  url: string;
  uploadDate?: string;
  mime_type?: string;
}

// Define common image regex (similar purpose to IMAGE_MIME_TYPES but works with URL)
// IMAGE_URL_REGEX is now likely only used within ResourcePreviewModal or its caller

const SponsorHome = () => {
  const { session, role } = useAuth();
  const token = session?.access_token;

  const navLinks = [
    { name: "Network", href: "/network" },
    { name: "Events", href: "/events" },
    { name: "Dashboard", href: "/sponsor" },
  ];

  const [sponsorData, setSponsorData] = useState<{
    name: string;
    description: string;
    profileUrl: string;
    links: string[];
  }>({
    name: "",
    description: "",
    profileUrl: "",
    links: [],
  });
  const [loadingSponsor, setLoadingSponsor] = useState(true);
  const [sponsorError, setSponsorError] = useState<string | null>(null);
  const [resources, setResources] = useState<SponsorResource[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewResource, setPreviewResource] =
    useState<SponsorResource | null>(null);
  const [loadingResources, setLoadingResources] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [resourceToDelete, setResourceToDelete] =
    useState<SponsorResource | null>(null);

  // Helper function to format dates properly
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Recent upload" : date.toLocaleDateString();
  };

  // Reset zoom level when opening a new preview
  useEffect(() => {
    if (previewResource) {
      // No zoom state to reset
    }
  }, [previewResource]);

  const fetchSponsorData = useCallback(async () => {
    if (!token) return;

    try {
      // Get sponsor name from multiple sources in order of reliability
      let sponsorName = "";

      // 1. Try to get from role data (most reliable if available)
      if (role && typeof role === "object" && "companyName" in role) {
        sponsorName = role.companyName;
      }
      // 2. Try localStorage if it was previously stored
      else if (localStorage.getItem("sponsorName")) {
        sponsorName = localStorage.getItem("sponsorName") || "";
      }
      // 3. Fallback to email extraction if needed
      else {
        const email = session?.user?.email;
        sponsorName = email ? email.split("@")[0] : "";

        // Store for future use
        if (sponsorName) {
          localStorage.setItem("sponsorName", sponsorName);
        }
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/get-one-sponsor-info`,
        { sponsor_name: sponsorName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.data) throw new Error("Failed to fetch sponsor data");
      const data = response.data;
      setSponsorData({
        name: data.company_name || sponsorName || "Sponsor Name Missing",
        description:
          data.about || data.description || "No description provided.",
        profileUrl: data.pfp_url || data.profileUrl || "/placeholder-logo.png",
        links: data.links || [],
      });
    } catch (error) {
      console.error("Error fetching sponsor data:", error);
      let errorMessage =
        "Could not retrieve sponsor information. Please try again later.";
      if (error instanceof Error) {
        errorMessage = `Error fetching sponsor data: ${error.message}`;
      }
      setSponsorError(errorMessage);
      setSponsorData({
        name: "Error",
        description: "Information unavailable.",
        profileUrl: "/placeholder-logo.png",
        links: [],
      });
    } finally {
      setLoadingSponsor(false);
    }
  }, [token, session, role]);

  const fetchResources = useCallback(async () => {
    if (!sponsorData.name) {
      console.log("Skipping resource fetch - sponsor name not available yet");
      setLoadingResources(false);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/${
          sponsorData.name
        }/resources`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.data) throw new Error("Failed to fetch resources");
      const data = response.data;
      const resourcesData = Array.isArray(data)
        ? data
        : data?.resources || data?.data || [];
      setResources(resourcesData);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoadingResources(false);
    }
  }, [token, sponsorData.name]);

  useEffect(() => {
    if (token) {
      fetchSponsorData();
    }
  }, [token, fetchSponsorData]);

  useEffect(() => {
    if (token && sponsorData.name) {
      fetchResources();
    }
  }, [token, sponsorData.name, fetchResources]);

  // Upload profile picture logic (needed by ProfileEditModal -> handleProfileUpdate)
  const uploadProfilePicture = async (file: File): Promise<string | null> => {
    if (!token) return null;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorData.name}/pfp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.photoUrl || data.url;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert(error instanceof Error ? error.message : "Upload failed");
      return null;
    }
  };

  const handleProfileUpdate = async (updatedProfile: {
    description: string;
    links: string[];
    newProfilePic: File | null;
  }) => {
    setIsUpdatingProfile(true);
    let newProfileUrl = sponsorData.profileUrl; // Start with current URL

    // 1. Upload new profile picture if provided
    if (updatedProfile.newProfilePic) {
      const uploadedUrl = await uploadProfilePicture(
        updatedProfile.newProfilePic
      );
      if (uploadedUrl) {
        newProfileUrl = uploadedUrl; // Update URL if upload succeeded
      } else {
        console.error(
          "Profile picture upload failed. Profile data not updated."
        );
        alert("Failed to upload profile picture. Please try again.");
        setIsUpdatingProfile(false);
        return; // Stop the update process if PFP upload fails
      }
    }

    // 2. Update other profile data (description, links)
    try {
      console.log("Updating sponsor details...");

      // Format the request body for the new API endpoint
      const requestBody = {
        about: updatedProfile.description,
        links: updatedProfile.links, // Send links directly as an array
      };

      console.log("Sending update with body:", requestBody);

      // Make the API call to update sponsor details using the new endpoint pattern
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/${
          sponsorData.name
        }/details`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Sponsor details updated successfully:", response.data);

      // Update local state on success
      setSponsorData((prevData) => ({
        ...prevData,
        description: updatedProfile.description,
        links: updatedProfile.links,
        profileUrl: newProfileUrl,
      }));
    } catch (error) {
      console.error("Error updating sponsor details:", error);
      alert("Failed to update sponsor details. Please try again.");

      // Optional: Still update profile picture in local state since that was successful
      if (newProfileUrl !== sponsorData.profileUrl) {
        setSponsorData((prevData) => ({
          ...prevData,
          profileUrl: newProfileUrl,
        }));
      }
    }
    setIsUpdatingProfile(false);
  };

  const handleResourceDelete = async (resource: SponsorResource) => {
    console.log("handleResourceDelete called for resource URL:", resource.url);

    if (!token || !resource.url) {
      console.error("Cannot delete resource: missing token or resource URL");
      return;
    }

    try {
      // Use the endpoint DELETE /sponsors/:companyName/resources
      // Send resourceUrl in the request body
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/${
          sponsorData.name
        }/resources`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Important for sending data in body
          },
          data: {
            // Use 'data' key for request body in axios.delete
            resourceUrl: resource.url,
          },
        }
      );
      console.log(
        `Successfully sent delete request for resource URL: ${resource.url}`
      );
      // Refresh resource list after deletion
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
      alert(`Failed to delete resource: ${resource.label}. Please try again.`);
    }
  };

  // Function to trigger delete confirmation
  const confirmResourceDelete = (resource: SponsorResource) => {
    setResourceToDelete(resource);
    setShowDeleteConfirmation(true);
  };

  // Function to execute deletion after confirmation
  const executeDelete = () => {
    if (resourceToDelete) {
      handleResourceDelete(resourceToDelete);
    }
    setShowDeleteConfirmation(false);
    setResourceToDelete(null);
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setResourceToDelete(null);
  };

  // Function to handle showing resource preview
  const showResourcePreview = (resource: SponsorResource) => {
    setPreviewResource(resource);
  };

  // Function to close the preview modal
  const closePreview = () => {
    setPreviewResource(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        isLogged={true}
        links={navLinks}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        role={role}
      />

      {/* Add padding-top to account for fixed navbar */}
      <div className="flex flex-col pt-[72px] flex-grow">
        <main className="flex-grow flex flex-col items-center justify-center py-24">
          {loadingSponsor ? (
            // Use navbar padding for alignment
            <div className="w-full px-8 sm:px-16 lg:px-24">
              <LoadingSpinner text="Loading sponsor information..." size="lg" />
            </div>
          ) : sponsorError ? (
            // Use navbar padding for alignment
            <div className="w-full px-8 sm:px-16 lg:px-24">
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <p className="font-bold">Error Loading Data</p>
                <p className="block sm:inline">{sponsorError}</p>
                <button
                  onClick={fetchSponsorData}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            // Apply the user-specified grid, gap, and padding classes
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full px-4 md:px-32">
              <div className="flex flex-col items-center justify-start h-full gap-8 w-full">
                <div className="w-full">
                  <h1 className="text-4xl font-bold font-outfit">
                    Welcome back,{" "}
                    <span className="text-bapred">{sponsorData.name}</span>!
                  </h1>
                </div>
                <SponsorDescription
                  profileUrl={sponsorData.profileUrl}
                  name={sponsorData.name}
                  description={sponsorData.description}
                  links={sponsorData.links}
                  onEditClick={() => setIsEditModalOpen(true)}
                  isProfileUpdating={isUpdatingProfile}
                />
              </div>

              {/* Resource Management */}
              <div className="h-full w-full">
                <div className="flex flex-col gap-8 h-full">
                  {/* Use ResourceUploadForm Component */}
                  <ResourceUploadForm
                    sponsorName={sponsorData.name}
                    token={token || ""}
                    onUploadSuccess={fetchResources} // Pass fetchResources to refresh list
                  />

                  {/* Use ResourceList Component */}
                  <ResourceList
                    resources={resources}
                    isLoading={loadingResources}
                    onDeleteConfirm={confirmResourceDelete}
                    onPreview={showResourcePreview}
                    formatDate={formatDate}
                        />
                      </div>
                  </div>
            </div>
          )}
        </main>
      </div>

      <Footer backgroundColor="#AF272F" />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        sponsorName={sponsorData.name}
        sponsorDescription={sponsorData.description}
        onUpdate={handleProfileUpdate}
        token={session?.access_token || ""}
        profileUrl={sponsorData.profileUrl}
        links={sponsorData.links}
      />

      {/* Resource Preview Modal */}
      <ResourcePreviewModal
              isOpen={!!previewResource}
              onClose={closePreview}
        resource={
          previewResource
            ? {
                name: previewResource.label, // Use label for title
                signed_url: previewResource.url, // Map url to signed_url
                mime_type: previewResource.mime_type, // Pass mime_type if available
              }
            : null
        }
      />

      {/* Delete Resource Confirmation Dialog */}
      {showDeleteConfirmation && resourceToDelete && (
        <ConfirmDialog
          isOpen={showDeleteConfirmation}
          onClose={cancelDelete}
          onConfirm={executeDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the resource: "${resourceToDelete.label}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          preventOutsideClick={true}
        />
      )}
    </div>
  );
};

export default SponsorHome;
