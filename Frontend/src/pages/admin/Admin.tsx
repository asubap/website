import { useEffect, useState, useRef } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import EmailList from "../../components/admin/EmailList";
import SponsorList from "../../components/admin/SponsorList";
import { useToast } from "../../context/toast/ToastContext";
import AddSponsorModal from "../../components/admin/AddSponsorModal";
import ResourceManagement from "../../components/admin/ResourceManagement";
import EboardManagement from "../../components/admin/EboardManagement";
import CreateAnnouncementModal from "../../components/admin/CreateAnnouncementModal";
import EditAnnouncementModal from "../../components/admin/EditAnnouncementModal";
import ViewAnnouncementModal from "../../components/admin/ViewAnnouncementModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import AddUserModal from "../../components/admin/AddUserModal";
import { getNavLinks } from "../../components/nav/NavLink";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { Announcement } from "../../types/index";
import { AnnouncementListShort } from "../../components/announcement/AnnouncementListShort";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/auth/authProvider";
import { MemberDetail } from "../../types/index";

// Define interfaces for API responses
interface UserInfo {
  email: string;
  role: string;
  name?: string;
}

interface ApiSponsor {
  company_name: string;
  email_list: string[];
  passcode: string;
  tier: string;
}

const Admin = () => {
  const { showToast } = useToast();
  const sponsorFormRef = useRef<HTMLFormElement>(null);
  const [showAddSponsorModal, setShowAddSponsorModal] = useState(false);

  // New state for announcements
  const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] =
    useState(false);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] =
    useState(false);
  const [announcementToEdit, setAnnouncementToEdit] =
    useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Add new state for viewing announcements
  const [showViewAnnouncementModal, setShowViewAnnouncementModal] =
    useState(false);
  const [announcementToView, setAnnouncementToView] =
    useState<Announcement | null>(null);

  // Add new state for delete confirmation
  const [showDeleteAnnouncementModal, setShowDeleteAnnouncementModal] =
    useState(false);
  const [announcementToDelete, setAnnouncementToDelete] =
    useState<Announcement | null>(null);

  const { role, session } = useAuth();

  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [tiers, setTiers] = useState<string[]>([]);
  const [members, setMembers] = useState<{ email: string; name?: string }[]>(
    []
  );

  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Add new state for member editing - corrected type
  const [memberDetails, setMemberDetails] = useState<{
    [key: string]: MemberDetail;
  }>({});

  // Add new state for showAddMemberModal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Add new state for showAddAdminModal
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  // State for ConfirmDialog
  interface ConfirmDialogInfo {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }

  const [confirmDialogInfo, setConfirmDialogInfo] = useState<ConfirmDialogInfo>(
    {
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
    }
  );

  const showConfirmationDialog = (
    title: string,
    message: string,
    onConfirmAction: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setConfirmDialogInfo({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirmAction();
        setConfirmDialogInfo((prev) => ({ ...prev, isOpen: false }));
      },
      confirmText,
      cancelText,
    });
  };

  useEffect(() => {
    if (!session) return;

    const fetchAdmins = async () => {
      setLoadingAdmins(true);
      const token = session.access_token;
      fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // Process e-board members
          const admins = data
            .filter((item: UserInfo) => item.role === "e-board")
            .map((item: UserInfo) => item.email);
          setAdminEmails(admins);
          const members = data
            .filter((item: UserInfo) => item.role === "general-member")
            .map((item: UserInfo) => ({ email: item.email, name: item.name }));
          setMembers(members);
          setLoadingAdmins(false);
          setLoadingMembers(false);
        })
        .catch((error) => {
          console.error("Error fetching member info:", error);
          setLoadingAdmins(false);
          setLoadingMembers(false);
        });
    };

    const fetchSponsors = async () => {
      const token = session.access_token;
      fetch(`${import.meta.env.VITE_BACKEND_URL}/sponsors/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const sponsors = data.map(
            (sponsor: ApiSponsor) => sponsor.company_name
          );
          const tiers = data.map((sponsor: ApiSponsor) => sponsor.tier);
          setSponsors(sponsors);
          setTiers(tiers);
        })
        .catch((error) => {
          console.error("Error fetching sponsors:", error);
        });
    };

    // New function to fetch announcements
    const fetchAnnouncements = async () => {
      setLoadingAnnouncements(true);
      const token = session.access_token;
      fetch(`${import.meta.env.VITE_BACKEND_URL}/announcements`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // Sort announcements by date (newest first) and pinned status
          const sortedAnnouncements = data.sort(
            (a: Announcement, b: Announcement) => {
              // First sort by pinned status (pinned items first)
              if (a.is_pinned && !b.is_pinned) return -1;
              if (!a.is_pinned && b.is_pinned) return 1;

              // Then sort by created_at (newer first) - safely handle null values
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateB - dateA;
            }
          );
          setAnnouncements(sortedAnnouncements);
          setLoadingAnnouncements(false);
        })
        .catch((error) => {
          console.error("Error fetching announcements:", error);
          setLoadingAnnouncements(false);
        });
    };

    fetchAdmins();
    fetchSponsors();
    fetchAnnouncements();
  }, [session]); // Add session as dependency

  const handleDelete = async (email: string) => {
    if (!session) return;

    const token = session.access_token;
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/delete-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_email: email }),
      });
      // Update the state to remove the deleted email
      setAdminEmails(adminEmails.filter((e) => e !== email));
      setSponsors(sponsors.filter((e) => e !== email));
      setMembers(members.filter((m) => m.email !== email));
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleDeleteSponsor = async (email: string) => {
    if (!session) return;

    const token = session.access_token;
    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/delete-sponsor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sponsor_name: email }),
        }
      );
      setSponsors(sponsors.filter((e) => e !== email));
      showToast("Sponsor deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting sponsor:", error);
    }
  };

  // Actual function to add sponsor after confirmation
  const actuallyAddSponsor = async (newSponsor: ApiSponsor) => {
    try {
      if (!session) return;
      const token = session.access_token;
      // Re-fetch sponsors from server to ensure data consistency (original logic)
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const updatedSponsors = data.map(
          (sponsor: ApiSponsor) => sponsor.company_name
        );
        const updatedTiers = data.map((sponsor: ApiSponsor) => sponsor.tier);
        setSponsors(updatedSponsors);
        setTiers(updatedTiers);
      } else {
        // Fallback to local state update if re-fetch fails
        setSponsors([...sponsors, newSponsor.company_name]);
        setTiers([...tiers, newSponsor.tier]);
      }
    } catch (error) {
      console.error("Error re-fetching sponsors:", error);
      // Fallback to local state update if re-fetch fails
      setSponsors([...sponsors, newSponsor.company_name]);
      setTiers([...tiers, newSponsor.tier]);
    }

    showToast("Sponsor added successfully", "success");
    if (sponsorFormRef.current) sponsorFormRef.current.reset();
    setShowAddSponsorModal(false); // Close the modal after successful addition
  };

  // Modified to show confirmation dialog
  const handleSponsorAdded = (newSponsor: ApiSponsor) => {
    actuallyAddSponsor(newSponsor); // Call directly
  };

  // Actual function to create announcement after confirmation
  const actuallyCreateAnnouncement = (newAnnouncement: Announcement) => {
    // Add the new announcement to the list and sort (original logic)
    setAnnouncements((prevAnnouncements) => {
      const updatedAnnouncements = [...prevAnnouncements, newAnnouncement];
      return updatedAnnouncements.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    });
    showToast("Announcement created successfully", "success");
    setShowCreateAnnouncementModal(false); // Close the modal
    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload(); // Or fetchAnnouncements() if preferred over reload
    }, 1000);
  };

  // Modified to show confirmation
  const handleAnnouncementCreated = (newAnnouncement: Announcement) => {
    actuallyCreateAnnouncement(newAnnouncement);
  };

  // Actual function to update announcement after confirmation
  const actuallyUpdateAnnouncement = (updatedAnnouncement: Announcement) => {
    setAnnouncements((prevAnnouncements) => {
      const updated = prevAnnouncements.map((a) =>
        a.id === updatedAnnouncement.id ? updatedAnnouncement : a
      );
      return updated.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    });
    showToast("Announcement updated successfully", "success");
    setShowEditAnnouncementModal(false);
    setAnnouncementToEdit(null);
  };

  // Modified to show confirmation
  const handleAnnouncementUpdated = (updatedAnnouncement: Announcement) => {
    actuallyUpdateAnnouncement(updatedAnnouncement);
  };

  const handleEditAnnouncementClick = (announcement: Announcement) => {
    setAnnouncementToEdit(announcement);
    setShowEditAnnouncementModal(true);
  };

  // Handler for viewing announcements
  const handleViewAnnouncementClick = (announcement: Announcement) => {
    setAnnouncementToView(announcement);
    setShowViewAnnouncementModal(true);
  };

  // Handler for deleting announcements
  const handleDeleteAnnouncementClick = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setShowDeleteAnnouncementModal(true);
  };

  const handleConfirmDeleteAnnouncement = async () => {
    if (!announcementToDelete || !session) return;

    try {
      const token = session.access_token;
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/announcements/delete-announcement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            announcement_id: announcementToDelete.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete announcement");
      }

      // Remove the deleted announcement from state
      setAnnouncements((prevAnnouncements) =>
        prevAnnouncements.filter((a) => a.id !== announcementToDelete.id)
      );

      showToast("Announcement deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      showToast("Failed to delete announcement. Please try again.", "error");
    } finally {
      setShowDeleteAnnouncementModal(false);
      setAnnouncementToDelete(null);
    }
  };

  // Update handleMemberEdit to implement the recommended pattern
  const handleMemberEdit = async (email: string) => {
    try {
      if (!session) {
        showToast("Authentication error. Please log in again.", "error");
        return;
      }

      const token = session.access_token;
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/member-info/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_email: email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch member details");
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const raw = data[0];
        const freshData: MemberDetail = {
          id: raw.id?.toString() || raw.user_id || raw.user_email,
          email: raw.user_email || raw.email || "",
          name: raw.name || "",
          phone: raw.phone || "",
          major: raw.major || "",
          graduationDate: raw.graduating_year
            ? String(raw.graduating_year)
            : raw.graduationDate || "",
          status: raw.member_status || raw.status || "Not Specified",
          about: raw.about || "",
          internship: raw.internship || "Not Specified",
          photoUrl: raw.profile_photo_url || raw.photoUrl || "",
          hours:
            raw.total_hours !== undefined
              ? String(raw.total_hours)
              : raw.hours || "0",
          rank: raw.rank || raw.role || "Not Provided",
          role: raw.role || "general-member",
        };

        // Update member details with fresh data
        setMemberDetails((prev) => ({
          ...prev,
          [email.trim().toLowerCase()]: freshData,
        }));
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
      showToast("Failed to fetch member details", "error");
    }
  };

  // Add fetchMembers function
  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      if (!session) {
        showToast("Authentication error. Please log in again.", "error");
        return;
      }
      const token = session.access_token;
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }
      const data = await response.json();
      const fetchedMembers = data
        .filter((item: UserInfo) => item.role === "general-member")
        .map((item: UserInfo) => ({ email: item.email, name: item.name })); // Keep name as is (could be undefined/null)

      fetchedMembers.sort(
        (
          a: { email: string; name?: string | null },
          b: { email: string; name?: string | null }
        ) => {
          const nameA = a.name?.trim().toLowerCase();
          const nameB = b.name?.trim().toLowerCase();

          // Members with no name go to the bottom
          if (!nameA && nameB) return 1;
          if (nameA && !nameB) return -1;
          if (!nameA && !nameB) {
            // Both names missing, sort by email
            return a.email.toLowerCase().localeCompare(b.email.toLowerCase());
          }

          // Both have names, sort by name
          if (nameA && nameB) {
            const nameComparison = nameA.localeCompare(nameB);
            if (nameComparison !== 0) return nameComparison;
          }

          // Names are equivalent (or one/both were missing and handled), sort by email as tie-breaker
          return a.email.toLowerCase().localeCompare(b.email.toLowerCase());
        }
      );

      setMembers(fetchedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      showToast("Failed to fetch members", "error");
    } finally {
      setLoadingMembers(false);
    }
  };

  // Function to re-fetch sponsors data
  const refetchSponsors = async () => {
    if (!session) return;

    try {
      const token = session.access_token;
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const sponsors = data.map(
          (sponsor: ApiSponsor) => sponsor.company_name
        );
        const tiers = data.map((sponsor: ApiSponsor) => sponsor.tier);
        setSponsors(sponsors);
        setTiers(tiers);
      }
    } catch (error) {
      console.error("Error re-fetching sponsors:", error);
      showToast("Failed to refresh sponsor data", "error");
    }
  };

  // Function to actually add members after confirmation
  const actuallyAddMembers = (newMembers: string[]) => {
    setMembers((prev) => [
      ...prev,
      ...newMembers.map((email: string) => ({ email, name: undefined })), // Ensure name is explicitly undefined or fetched if available
    ]);
    showToast(`${newMembers.length} member(s) added successfully`, "success");
    setShowAddMemberModal(false); // Close the modal
    fetchMembers(); // Refresh member list
  };

  // Modified onUserAdded for members to show confirmation
  const onAddMemberSubmit = (newMembers: string[]) => {
    showConfirmationDialog(
      "Confirm Add Members",
      `Are you sure you want to add ${newMembers.length} new member(s)?`,
      () => actuallyAddMembers(newMembers),
      "Confirm Add"
    );
  };

  // Function to actually add admins after confirmation
  const actuallyAddAdmins = (newAdmins: string[]) => {
    setAdminEmails((prev) => [...prev, ...newAdmins]);
    showToast(`${newAdmins.length} admin(s) added successfully`, "success");
    setShowAddAdminModal(false); // Close the modal
    // Re-fetch admins or update state as needed. Assuming fetchAdmins() exists and is appropriate
    // For simplicity, directly updating state was done. If fetchAdmins is better:
    // fetchAdmins();
  };

  // Modified onUserAdded for admins to show confirmation
  const onAddAdminSubmit = (newAdmins: string[]) => {
    showConfirmationDialog(
      "Confirm Add Admins",
      `Are you sure you want to add ${newAdmins.length} new admin(s)?`,
      () => actuallyAddAdmins(newAdmins),
      "Confirm Add"
    );
  };

  // --- Sponsor Tier Update Logic ---
  const actuallyUpdateSponsorTier = async (email: string, newTier: string) => {
    if (!session) {
      showToast("Authentication error. Please log in again.", "error");
      return;
    }
    const token = session.access_token;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/change-sponsor-tier`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sponsor_name: email, tier: newTier }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change tier");
      }
      showToast("Sponsor tier updated successfully", "success");
      refetchSponsors(); // Refresh sponsor list to show new tier
    } catch (error: unknown) {
      console.error("Error updating sponsor tier:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to update sponsor tier. Please try again.",
        "error"
      );
    }
  };

  const handleSponsorTierChangeConfirm = (email: string, newTier: string) => {
    showConfirmationDialog(
      "Confirm Tier Change",
      `Are you sure you want to change ${email}'s tier to ${newTier}?`,
      () => actuallyUpdateSponsorTier(email, newTier),
      "Confirm Change"
    );
  };

  // --- Sponsor Profile Update Logic ---
  interface SponsorUpdateData {
    companyName: string; // To identify the sponsor
    description: string;
    links: string[];
    // photoUrl?: string; // If photo updates are handled here too
  }

  const actuallyUpdateSponsorProfile = async (
    updatedData: SponsorUpdateData
  ) => {
    if (!session) {
      showToast("Authentication error. Please log in again.", "error");
      return;
    }
    const token = session.access_token;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/${
          updatedData.companyName
        }/details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            about: updatedData.description,
            links: updatedData.links,
            // pfp_url: updatedData.photoUrl, // If handling photo updates
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update sponsor details"
        );
      }
      showToast("Sponsor details updated successfully", "success");
      refetchSponsors(); // Refresh sponsor list, might need more specific update if only details changed
    } catch (error: unknown) {
      console.error("Error updating sponsor details:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to update sponsor details. Please try again.",
        "error"
      );
    }
  };

  const promptSponsorProfileUpdate = (updatedData: SponsorUpdateData) => {
    actuallyUpdateSponsorProfile(updatedData);
  };

  // --- Member Update Logic ---
  const actuallyUpdateMember = async (updatedData: MemberDetail) => {
    if (!session) {
      showToast("Authentication error. Please log in again.", "error");
      return;
    }
    try {
      // Update local memberDetails state immediately for responsiveness of the modal if it relies on it.
      setMemberDetails((prevDetails) => ({
        ...prevDetails,
        [updatedData.email.trim().toLowerCase()]: updatedData,
      }));

      showToast("Member details updated successfully", "success");
      await fetchMembers(); // Crucial: Re-fetch the entire members list from the server to update the list view.
    } catch (error: unknown) {
      console.error("Error during member update finalization:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to update member details. Please try again.",
        "error"
      );
    }
  };

  const handleMemberUpdateSave = (updatedData: MemberDetail) => {
    // Directly call actuallyUpdateMember
    actuallyUpdateMember(updatedData);
  };

  return (
    <div className="flex flex-col min-h-screen font-outfit">
      <Navbar
        links={getNavLinks(!!session)}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        isLogged={!!session}
        role={role}
      />

      {/* Add padding-top to account for fixed navbar */}
      <div className="flex flex-col flex-grow p-8 pt-32 px-8 sm:px-16 lg:px-24">
        <main className="order-1 md:order-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-bapred mb-6 text-center">
            Admin Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
            {/* Announcements column - now order-3 on mobile to appear after Past Events */}
            <div className="order-3 md:order-2">
              <div className="flex items-center mb-2">
                <h2 className="text-2xl font-semibold">Announcements</h2>
                <button
                  className="ml-auto px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
                  onClick={() => setShowCreateAnnouncementModal(true)}
                >
                  + <span className="hidden md:inline">New </span>Announcement
                </button>
              </div>
              {loadingAnnouncements ? (
                <LoadingSpinner text="Loading announcements..." size="md" />
              ) : announcements.length > 0 ? (
                <AnnouncementListShort
                  announcements={announcements}
                  onEdit={handleEditAnnouncementClick}
                  onView={handleViewAnnouncementClick}
                  onDelete={handleDeleteAnnouncementClick}
                />
              ) : (
                <p className="text-gray-500 text-m">
                  No announcements available.
                </p>
              )}
            </div>

            {/* Admin Users */}
            <div className="order-4 md:order-4">
              <div className="flex items-center mb-2">
                <h2 className="text-2xl font-semibold">Admin Users</h2>
                <button
                  className="ml-auto px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
                  onClick={() => setShowAddAdminModal(true)}
                >
                  + <span className="hidden md:inline">Add </span>Admin
                </button>
              </div>
              {loadingAdmins ? (
                <LoadingSpinner text="Loading admins..." size="md" />
              ) : (
                <EmailList
                  emails={adminEmails.map((email) => ({ email }))}
                  onDelete={handleDelete}
                  userType="admin"
                  clickable={false}
                />
              )}
            </div>

            {/* Sponsors */}
            <div className="order-5 md:order-5">
              <div className="flex items-center mb-2">
                <h2 className="text-2xl font-semibold">Sponsors</h2>
                <button
                  className="ml-auto px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
                  onClick={() => setShowAddSponsorModal(true)}
                >
                  + <span className="hidden md:inline">New </span>Sponsor
                </button>
              </div>
              <SponsorList
                emails={sponsors}
                tiers={tiers}
                onDelete={handleDeleteSponsor}
                userType="sponsor"
                onTierChangeConfirm={handleSponsorTierChangeConfirm}
                onProfileUpdateConfirm={promptSponsorProfileUpdate}
                showConfirmationDialog={showConfirmationDialog}
              />
            </div>

            {/* General Members */}
            <div className="order-6 md:order-6">
              <div className="flex items-center mb-2">
                <h2 className="text-2xl font-semibold">General Members</h2>
                <button
                  className="ml-auto px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
                  onClick={() => setShowAddMemberModal(true)}
                >
                  + <span className="hidden md:inline">Add </span>Member
                </button>
              </div>
              {loadingMembers ? (
                <LoadingSpinner text="Loading members..." size="md" />
              ) : (
                <EmailList
                  emails={members}
                  onDelete={handleDelete}
                  userType="member"
                  onEdit={handleMemberEdit}
                  onSave={handleMemberUpdateSave}
                  memberDetails={memberDetails}
                />
              )}
            </div>

            {/* Resource Management */}
            <div className="order-7 md:order-7 col-span-1 md:col-span-2 pb-8">
              <ResourceManagement />
            </div>

            {/* Eboard Management */}
            <div className="order-8 md:order-8 col-span-1 md:col-span-2 pb-8">
              <EboardManagement />
            </div>
          </div>
        </main>
      </div>
      <Footer backgroundColor="#AF272F" />

      {showAddSponsorModal && (
        <AddSponsorModal
          onClose={() => setShowAddSponsorModal(false)}
          onSponsorAdded={handleSponsorAdded}
        />
      )}

      {/* Announcement Creation Modal */}
      {showCreateAnnouncementModal && (
        <CreateAnnouncementModal
          onClose={() => setShowCreateAnnouncementModal(false)}
          onAnnouncementCreated={handleAnnouncementCreated}
        />
      )}
      {showEditAnnouncementModal && announcementToEdit && (
        <EditAnnouncementModal
          isOpen={showEditAnnouncementModal}
          onClose={() => {
            setShowEditAnnouncementModal(false);
            setAnnouncementToEdit(null);
          }}
          announcementToEdit={announcementToEdit}
          onAnnouncementUpdated={handleAnnouncementUpdated}
        />
      )}
      {showViewAnnouncementModal && announcementToView && (
        <ViewAnnouncementModal
          isOpen={showViewAnnouncementModal}
          onClose={() => {
            setShowViewAnnouncementModal(false);
            setAnnouncementToView(null);
          }}
          announcement={announcementToView}
        />
      )}
      <ConfirmationModal
        isOpen={showDeleteAnnouncementModal}
        onClose={() => setShowDeleteAnnouncementModal(false)}
        onConfirm={handleConfirmDeleteAnnouncement}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {showAddMemberModal && (
        <AddUserModal
          role="general-member"
          title="Add General Member"
          label="Email Addresses"
          buttonText="Add Member"
          onClose={() => setShowAddMemberModal(false)}
          onUserAdded={onAddMemberSubmit}
        />
      )}

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <AddUserModal
          role="e-board"
          title="Add Admin"
          label="Email Addresses"
          buttonText="Add Admin"
          onClose={() => setShowAddAdminModal(false)}
          onUserAdded={onAddAdminSubmit}
        />
      )}

      {/* Confirmation Dialog for all actions */}
      <ConfirmDialog
        isOpen={confirmDialogInfo.isOpen}
        onClose={() =>
          setConfirmDialogInfo((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmDialogInfo.onConfirm}
        title={confirmDialogInfo.title}
        message={confirmDialogInfo.message}
        confirmText={confirmDialogInfo.confirmText ?? "Confirm"}
        cancelText={confirmDialogInfo.cancelText ?? "Cancel"}
      />
    </div>
  );
};

export default Admin;
