import { useEffect, useState, useRef } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { supabase } from "../../context/auth/supabaseClient";
import EmailList from "../../components/admin/EmailList";
import { useToast } from "../../context/toast/ToastContext";
import CreateEventModal from "../../components/admin/CreateEventModal";
import AddSponsorModal from "../../components/admin/AddSponsorModal";
import ResourceManagement from "../../components/admin/ResourceManagement";
import EditEventModal from "../../components/admin/EditEventModal";
import CreateAnnouncementModal from "../../components/admin/CreateAnnouncementModal";
import EditAnnouncementModal from "../../components/admin/EditAnnouncementModal";
import ViewAnnouncementModal from "../../components/admin/ViewAnnouncementModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";

import { Event, Announcement } from "../../types";
import { EventListShort } from "../../components/event/EventListShort";
import { AnnouncementListShort } from "../../components/announcement/AnnouncementListShort";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/auth/authProvider";

// Define interfaces for API responses
interface UserInfo {
  email: string;
  role: string;
}

interface ApiSponsor {
  company_name: string;
  email_list: string[];
  passcode: string;
}

const Admin = () => {
  const { showToast } = useToast();
  const adminFormRef = useRef<HTMLFormElement>(null);
  const sponsorFormRef = useRef<HTMLFormElement>(null);
  const memberFormRef = useRef<HTMLFormElement>(null);

  const [adminInputError, setAdminInputError] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showAddSponsorModal, setShowAddSponsorModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  // New state for announcements
  const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] = useState(false);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Add new state for viewing announcements
  const [showViewAnnouncementModal, setShowViewAnnouncementModal] = useState(false);
  const [announcementToView, setAnnouncementToView] = useState<Announcement | null>(null);

  // Add new state for delete confirmation
  const [showDeleteAnnouncementModal, setShowDeleteAnnouncementModal] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  const navLinks = [
    { name: "Network", href: "/network" },
    { name: "Events", href: "/events" },
    { name: "Dashboard", href: "/admin" },
  ];

  const isPastDate = (dateString: string): boolean => {
    // Parse the input date string into a Date object
    const inputDate = new Date(dateString);

    // Get the current date and reset its time to midnight
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

    // Compare the input date with the current date
    return inputDate < currentDate;
  };

  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [members, setMembers] = useState<string[]>([]);

  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const { role } = useAuth();

  // Reset input error state when clicking away from input
  const handleInputFocus = (inputType: "admin") => {
    if (inputType === "admin") {
      setAdminInputError(false);
    }
  };

  // Validate email function to reuse code
  const validateEmail = (email: string): boolean => {
    if (!email) {
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoadingAdmins(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // Fetch user role
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
            console.log("API response data:", data);
            // Process e-board members
            const admins = data
              .filter((item: UserInfo) => item.role === "e-board")
              .map((item: UserInfo) => item.email);
            console.log(admins);
            setAdminEmails(admins);
            const members = data
              .filter((item: UserInfo) => item.role === "general-member")
              .map((item: UserInfo) => item.email);
            console.log(members);
            setMembers(members);
            setLoadingAdmins(false);
            setLoadingMembers(false);
          })
          .catch((error) => {
            console.error("Error fetching member info:", error);
            setLoadingAdmins(false);
            setLoadingMembers(false);
          });
      }
    };

    fetchAdmins();

    const fetchSponsors = async () => {
      setLoadingSponsors(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
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
            console.log("Sponsors:", data);
            const sponsors = data.map(
              (sponsor: ApiSponsor) => sponsor.company_name
            );
            console.log("Sponsors:", sponsors);
            setSponsors(sponsors);
            setLoadingSponsors(false);
          })
          .catch((error) => {
            console.error("Error fetching sponsors:", error);
            setLoadingSponsors(false);
          });
      }
    };

    fetchSponsors();

    const fetchEvents = async () => {
      setLoadingEvents(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const token = session.access_token;
        fetch(`${import.meta.env.VITE_BACKEND_URL}/events`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Events:", data);
            setPastEvents(
              data.filter((event: Event) => isPastDate(event.event_date))
            );
            setUpcomingEvents(
              data.filter((event: Event) => !isPastDate(event.event_date))
            );
            setLoadingEvents(false);
          })
          .catch((error) => {
            console.error("Error fetching events:", error);
            setLoadingEvents(false);
          });
      }
    };

    fetchEvents();

    // New function to fetch announcements
    const fetchAnnouncements = async () => {
      setLoadingAnnouncements(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
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
            console.log("Announcements:", data);
            // Sort announcements by date (newest first) and pinned status
            const sortedAnnouncements = data.sort((a: Announcement, b: Announcement) => {
              // First sort by pinned status (pinned items first)
              if (a.is_pinned && !b.is_pinned) return -1;
              if (!a.is_pinned && b.is_pinned) return 1;
              
              // Then sort by date (newer first)
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            setAnnouncements(sortedAnnouncements);
            setLoadingAnnouncements(false);
          })
          .catch((error) => {
            console.error("Error fetching announcements:", error);
            setLoadingAnnouncements(false);
          });
      }
    };

    fetchAnnouncements();
  }, []);

  const handleRoleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    role: string
  ) => {
    e.preventDefault();

    // Get form and email value
    const form = e.target as HTMLFormElement;
    const emailInput = form.email as HTMLInputElement;
    const email = emailInput.value.trim();

    // Set the appropriate error state to update UI based on role type
    const isRoleAdmin = role === "e-board";

    // Validate email presence
    if (!email) {
      showToast("Please enter an email address", "error");
      if (isRoleAdmin) {
        setAdminInputError(true);
      }
      return;
    }

    // Validate email format using regex
    if (!validateEmail(email)) {
      showToast("Please enter a valid email address", "error");
      if (isRoleAdmin) {
        setAdminInputError(true);
      }
      return;
    }

    // If we got here, reset error state as email is valid
    if (isRoleAdmin) {
      setAdminInputError(false);
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      try {
        // Fetch user role
        const token = session.access_token;
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/add-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ user_email: email, role: role }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add user");
        }

        // Update local state based on role
        if (role === "e-board") {
          setAdminEmails([...adminEmails, email]);
          showToast("Admin added successfully", "success");
          if (adminFormRef.current) adminFormRef.current.reset();
        } else if (role === "sponsor") {
          setSponsors([...sponsors, email]);
          showToast("Sponsor added successfully", "success");
          if (sponsorFormRef.current) sponsorFormRef.current.reset();
        }
      } catch (error) {
        console.error("Error adding user:", error);
        showToast("Failed to add user. Please try again.", "error");
      }
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const emailInput = form.email as HTMLInputElement;
    const email = emailInput.value.trim();

    if (!email) {
      showToast("Please enter an email address", "error");
      return;
    }

    if (!validateEmail(email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const token = session.access_token;
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/add-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ user_email: email, role: "general-member" }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add member");
        }

        setMembers([...members, email]);
        showToast("Member added successfully", "success");
        if (memberFormRef.current) memberFormRef.current.reset();
      }
    } catch (error) {
      console.error("Error adding member:", error);
      showToast("Failed to add member. Please try again.", "error");
    }
  };

  const handleDelete = async (email: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
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
        setMembers(members.filter((e) => e !== email));
      } catch (error) {
        console.error("Error deleting admin:", error);
      }
    }
  };

  const handleDeleteSponsor = async (email: string) => {
    console.log("Deleting sponsor:", email);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
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
    }
  };
 

  // Handle a newly created event
  const handleEventCreated = async (newEvent: Event) => {
    // Determine if it's upcoming or past
    const isNewEventPast = isPastDate(newEvent.event_date);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const token = session.access_token;
      try {
        await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/events/add-event`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({event_name: newEvent.event_name,
                                  event_description: newEvent.event_description,
                                  event_location: newEvent.event_location,
                                  event_lat: newEvent.event_lat,
                                  event_long: newEvent.event_long,
                                  event_date: newEvent.event_date,
                                  event_time: newEvent.event_time,
                                  event_hours: newEvent.event_hours,
                                  event_hours_type: newEvent.event_hours_type,
                                  sponsors_attending: newEvent.sponsors_attending }),
          }
        );

        showToast("Event created successfully", "success");
        
      } catch (error) {
        console.error("Error creating Event:", error);
      }
    }

    // Update the correct list and sort it
    if (!isNewEventPast) {
      setUpcomingEvents((prevEvents) =>
        [...prevEvents, newEvent].sort(
          (a, b) =>
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        )
      );
    } else {
      setPastEvents(
        (prevEvents) =>
          [...prevEvents, newEvent].sort(
            (a, b) =>
              new Date(b.event_date).getTime() -
              new Date(a.event_date).getTime()
          ) // Past events descending
      );
    }
  };

  const handleSponsorAdded = (newSponsor: ApiSponsor) => {
    console.log("New sponsor data:", newSponsor);
    setSponsors([...sponsors, newSponsor.company_name]);
    showToast("Sponsor added successfully", "success");
    if (sponsorFormRef.current) sponsorFormRef.current.reset();
  };

  const handleEventUpdated = (updatedEvent: Event) => {
    const updateList = (list: Event[]) =>
      list.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));

    // Determine if the event moved between past and upcoming
    const isNowPast = isPastDate(updatedEvent.event_date);
    const wasPast = pastEvents.some(e => e.id === updatedEvent.id);

    if (isNowPast && !wasPast) {
      // Moved from upcoming to past
      setUpcomingEvents((prev) => prev.filter(e => e.id !== updatedEvent.id));
      setPastEvents((prev) => [...prev, updatedEvent].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()));
    } else if (!isNowPast && wasPast) {
      // Moved from past to upcoming
      setPastEvents((prev) => prev.filter(e => e.id !== updatedEvent.id));
      setUpcomingEvents((prev) => [...prev, updatedEvent].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
    } else {
      // Updated within the same list
      setUpcomingEvents((prev) => updateList(prev));
      setPastEvents((prev) => updateList(prev));
    }

    setShowEditEventModal(false); // Close modal on success
    setEventToEdit(null);
  };

  const handleEditEventClick = (event: Event) => {
    setEventToEdit(event);
    setShowEditEventModal(true);
  };

  // Handle a newly created announcement
  const handleAnnouncementCreated = (newAnnouncement: Announcement) => {
    // Add the new announcement to the list and sort
    setAnnouncements(prevAnnouncements => {
      const updatedAnnouncements = [...prevAnnouncements, newAnnouncement];
      return updatedAnnouncements.sort((a, b) => {
        // First sort by pinned status (pinned items first)
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        
        // Then sort by date (newer first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    });
  };

  // Handle editing an announcement
  const handleAnnouncementUpdated = (updatedAnnouncement: Announcement) => {
    setAnnouncements(prevAnnouncements => {
      const updated = prevAnnouncements.map(a => 
        a.id === updatedAnnouncement.id ? updatedAnnouncement : a
      );
      
      // Re-sort after update
      return updated.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    });
    
    setShowEditAnnouncementModal(false);
    setAnnouncementToEdit(null);
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
    if (!announcementToDelete) return;
    
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (session) {
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
              announcement_id: announcementToDelete.id 
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete announcement");
        }

        // Remove the deleted announcement from state
        setAnnouncements(prevAnnouncements => 
          prevAnnouncements.filter(a => a.id !== announcementToDelete.id)
        );
        
        showToast("Announcement deleted successfully", "success");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      showToast("Failed to delete announcement. Please try again.", "error");
    } finally {
      setShowDeleteAnnouncementModal(false);
      setAnnouncementToDelete(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-outfit">
      <Navbar
        links={navLinks}
        isLogged={true}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        role={role}
      />

      {/* Add padding-top to account for fixed navbar */}
      <div className="flex flex-col flex-grow pt-24">
        <main className="flex-grow flex flex-col items-center justify-center h-full w-full my-12">
          <h1 className="text-4xl font-bold text-left w-full px-8 sm:px-16 lg:px-24 mb-6">
            Admin Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full px-8 sm:px-16 lg:px-24">
            {/* Events column */}
            <div className="order-1 md:order-1">
              <div className="flex items-center mb-2">
                <h2 className="text-2xl font-semibold">Upcoming Events</h2>
                <button
                  className="ml-auto px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
                  onClick={() => setShowCreateEventModal(true)}
                >
                  + <span className="hidden md:inline">New </span>Event
                </button>
              </div>
              {loadingEvents ? (
                <LoadingSpinner text="Loading upcoming events..." size="md" />
              ) : upcomingEvents.length > 0 ? (
                <EventListShort events={upcomingEvents} onEdit={handleEditEventClick} />
              ) : (
                <p className="text-gray-500 text-sm">
                  No upcoming events scheduled.
                </p>
              )}
            </div>

            {/* Past Events - now order-2 on mobile to appear directly after Upcoming Events */}
            <div className="order-2 md:order-3">
              <div className="flex items-center mb-2">
                <h2 className="text-2xl font-semibold">Past Events</h2>
              </div>
              <div className="max-h-72 overflow-y-auto pr-2">
                {loadingEvents ? (
                  <LoadingSpinner text="Loading events..." size="md" />
                ) : pastEvents.length > 0 ? (
                  <EventListShort events={pastEvents} onEdit={handleEditEventClick} />
                ) : (
                  <p className="text-gray-500 text-sm">No past events found.</p>
                )}
              </div>
            </div>

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
              <div className="max-h-72 overflow-y-auto pr-2">
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
                  <p className="text-gray-500 text-sm">
                    No announcements available.
                  </p>
                )}
              </div>
            </div>

            {/* Admin Users */}
            <div className="order-4 md:order-4">
              <h2 className="text-2xl font-semibold mb-2">Admin Users</h2>
              <form
                className="flex gap-4 justify-between items-center"
                onSubmit={(e) => handleRoleSubmit(e, "e-board")}
                ref={adminFormRef}
              >
                <input
                  type="text"
                  placeholder="Enter admin email.."
                  className={`w-3/4 px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-bapred transition-colors ${
                    adminInputError
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  name="email"
                  onFocus={() => handleInputFocus("admin")}
                />
                <button className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors whitespace-nowrap">
                  + <span className="hidden md:inline">Add </span>Admin
                </button>
              </form>
              {loadingAdmins ? (
                <LoadingSpinner text="Loading admins..." size="md" />
              ) : (
                <EmailList
                  emails={adminEmails}
                  onDelete={handleDelete}
                  userType="admin"
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
              {loadingSponsors ? (
                <LoadingSpinner text="Loading sponsors..." size="md" />
              ) : (
                <EmailList
                  emails={sponsors}
                  onDelete={handleDeleteSponsor}
                  userType="sponsor"
                />
              )}
            </div>

            {/* General Members */}
            <div className="order-6 md:order-6">
              <h2 className="text-2xl font-semibold mb-2">General Members</h2>
              <form
                className="flex gap-4 justify-between items-center"
                onSubmit={(e) => handleMemberSubmit(e)}
                ref={memberFormRef}
              >
                <input
                  type="text"
                  placeholder="Enter member email.."
                  className={`w-3/4 px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-bapred transition-colors ${
                    adminInputError
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  name="email"
                  onFocus={() => handleInputFocus("admin")}
                />
                <button className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors whitespace-nowrap">
                  + <span className="hidden md:inline">Add </span>Member
                </button>
              </form>
              {loadingMembers ? (
                <LoadingSpinner text="Loading members..." size="md" />
              ) : (
                <EmailList
                  emails={members}
                  onDelete={handleDelete}
                  userType="admin"
                />
              )}
            </div>

            {/* Resource Management */}
            <div className="order-7 md:order-7 col-span-1 md:col-span-2">
              <ResourceManagement />
            </div>
          </div>
        </main>
      </div>

      <Footer backgroundColor="#AF272F" />

      {/* Event Creation Modal */}
      {showCreateEventModal && (
        <CreateEventModal
          onClose={() => setShowCreateEventModal(false)}
          onEventCreated={handleEventCreated}
        />
      )}

      {showAddSponsorModal && (
        <AddSponsorModal
          onClose={() => setShowAddSponsorModal(false)}
          onSponsorAdded={handleSponsorAdded}
        />
      )}

      {/* Edit Event Modal */}
      {showEditEventModal && eventToEdit && (
        <EditEventModal
          isOpen={showEditEventModal}
          onClose={() => {
            setShowEditEventModal(false);
            setEventToEdit(null);
          }}
          eventToEdit={eventToEdit}
          onEventUpdated={handleEventUpdated}
        />
      )}

      {/* Announcement Creation Modal */}
      {showCreateAnnouncementModal && (
        <CreateAnnouncementModal
          onClose={() => setShowCreateAnnouncementModal(false)}
          onAnnouncementCreated={handleAnnouncementCreated}
        />
      )}

      {/* Edit Announcement Modal */}
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

      {/* View Announcement Modal */}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        onDelete={handleConfirmDeleteAnnouncement}
        isOpen={showDeleteAnnouncementModal}
        onClose={() => setShowDeleteAnnouncementModal(false)}
        onConfirm={handleConfirmDeleteAnnouncement}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Admin;
