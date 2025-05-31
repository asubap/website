import React, { useState, useEffect } from "react";
import EventCheckIn from "./EventCheckIn";
import EventRSVP from "./EventRSVP";
import { useAuth } from "../../context/auth/authProvider";
import { Event as EventType } from "../../types";
import { Megaphone, Trash2, ChevronDown, ChevronUp, Plus, MoreHorizontal } from "lucide-react";
import EmailList from "../admin/EmailList";
import { useToast } from "../../context/toast/ToastContext";
import Modal from "../ui/Modal";
import SearchInput from "../common/SearchInput";

interface EventWithUsers extends EventType {
  attending_users?: { name: string; email: string }[];
  rsvped_users?: { name: string; email: string }[];
}

interface EventCardProps {
  event: EventWithUsers;
  isPast: boolean;
  isHighlighted?: boolean;
  registerRef?: (element: HTMLDivElement | null) => void;
  hideRSVP?: boolean;
  onEdit?: () => void;
  onAnnounce?: () => void;
  onDelete?: () => void;
}

export const formatDateTime = (date?: string, time?: string | null) => {
  if (!date) return null;
  const eventDate = new Date(`${date}T${time || '00:00:00'}`);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return time ? `${formattedDate} at ${formattedTime}` : formattedDate;
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isPast,
  isHighlighted,
  registerRef,
  hideRSVP = false,
  onEdit,
  onAnnounce,
  onDelete,
}) => {
  const { session, role, loading } = useAuth();
  const { showToast } = useToast();
  const [attendees, setAttendees] = useState<{name: string, email: string}[]>(event.attending_users || []);
  const [rsvps, setRSVPs] = useState<{name: string, email: string}[]>(event.rsvped_users || []);
  const [selectedEntityMenu, setSelectedEntityMenu] = useState<"attendees" | "rsvps" | null>(null);
  const [showAddRSVPModal, setShowAddRSVPModal] = useState(false);
  const [showAddAttendeeModal, setShowAddAttendeeModal] = useState(false);
  const [isAddingRSVP, setIsAddingRSVP] = useState(false);
  const [isAddingAttendee, setIsAddingAttendee] = useState(false);
  const [allMembers, setAllMembers] = useState<{name: string, email: string}[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<{name: string, email: string}[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<{name: string, email: string}[]>([]);

  // Role checking logic - Check for string role names
  const isMember = role === "general-member" || role === "admin";
  const isSponsor = role === "sponsor";
  const isLoggedIn = !!session;
  const isAdmin = role === "e-board";

  // Define highlight classes using Tailwind ring utility - focusing on color transition
  const highlightClasses = isHighlighted
    ? "ring-bapred" // Apply red ring color when highlighted
    : "ring-transparent"; // Use transparent ring color when not highlighted

  // Update state when event prop changes
  useEffect(() => {
    setAttendees(event.attending_users || []);
    setRSVPs(event.rsvped_users || []);
  }, [event]);

  // Fetch all members when either modal opens
  useEffect(() => {
    if (showAddRSVPModal || showAddAttendeeModal) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      })
        .then(res => res.json())
        .then(data => {
          // Filter for general members only
          const members = data.filter((m: any) => m.role === 'general-member');
          setAllMembers(members);
          setFilteredMembers(members);
        });
    }
  }, [showAddRSVPModal, showAddAttendeeModal, session]);

  // Search logic
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setFilteredMembers(
      allMembers.filter(
        m =>
          (m.name && m.name.toLowerCase().includes(value.toLowerCase())) ||
          m.email.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleSelectMember = (member: {name: string, email: string}) => {
    if (!selectedMembers.some(m => m.email === member.email)) {
      setSelectedMembers(prev => [...prev, member]);
    }
    setSearchValue("");
    setFilteredMembers([]);
  };

  const handleRemoveSelectedMember = (email: string) => {
    setSelectedMembers(prev => prev.filter(m => m.email !== email));
  };

  const handleDeleteRSVP = async (email: string) => {
    if (!session?.access_token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/events/unrsvp/${event.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_email: email }),
      });

      if (!response.ok) throw new Error("Failed to remove RSVP");
      // Fetch the latest event data
      const [updatedEvent] = await fetchEventById(event.id);
      setRSVPs(updatedEvent.rsvped_users || []);
      showToast("RSVP removed successfully", "success");
    } catch (error) {
      console.error("Error removing RSVP:", error);
      showToast("Failed to remove RSVP", "error");
    }
  };

  const handleDeleteAttendee = async (email: string) => {
    if (!session?.access_token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/events/delete-member-attending`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          eventId: event.id,
          userEmail: email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to remove attendee", "error");
        return;
      }

      // Fetch the latest event data
      const [updatedEvent] = await fetchEventById(event.id);
      setAttendees(updatedEvent.attending_users || []);
      showToast("Attendee removed successfully", "success");
    } catch (error) {
      console.error("Error removing attendee:", error);
      showToast("Failed to remove attendee", "error");
    }
  };

  // Reset selection when modal closes
  useEffect(() => {
    if (!showAddRSVPModal && !showAddAttendeeModal) {
      setSelectedMembers([]);
      setSearchValue("");
      setFilteredMembers(allMembers);
    }
  }, [showAddRSVPModal, showAddAttendeeModal, allMembers]);

  // Add RSVP for all selected
  const handleAddRSVP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!session?.access_token || selectedMembers.length === 0) return;
    setIsAddingRSVP(true);
    try {
      for (const member of selectedMembers) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/events/rsvp/${event.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_email: member.email }),
        });
      }
      // Fetch the latest event data
      const [updatedEvent] = await fetchEventById(event.id);
      setRSVPs(updatedEvent.rsvped_users || []);
      showToast("RSVP(s) added successfully", "success");
      setShowAddRSVPModal(false);
      setSelectedMembers([]);
    } catch (error) {
      console.error("Error adding RSVP(s):", error);
      showToast("Failed to add RSVP(s)", "error");
    } finally {
      setIsAddingRSVP(false);
    }
  };

  // Add Attendee for all selected
  const handleAddAttendee = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!session?.access_token || selectedMembers.length === 0) return;
    setIsAddingAttendee(true);
    try {
      for (const member of selectedMembers) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/events/add-member-attending`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ eventId: event.id, userEmail: member.email }),
        });
      }
      // Fetch the latest event data
      const [updatedEvent] = await fetchEventById(event.id);
      setAttendees(updatedEvent.attending_users || []);
      showToast("Attendee(s) added successfully", "success");
      setShowAddAttendeeModal(false);
      setSelectedMembers([]);
    } catch (error) {
      console.error("Error adding attendee(s):", error);
      showToast("Failed to add attendee(s)", "error");
    } finally {
      setIsAddingAttendee(false);
    }
  };

  // Helper to fetch the latest event data by ID
  const fetchEventById = async (eventId: string) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ event_id: eventId }),
    });
    if (!response.ok) throw new Error("Failed to fetch event");
    return await response.json();
  };

  return (
    <div
      ref={registerRef}
      // Apply base styles, border, always-on ring-2/inset, transition-colors, and conditional ring color
      className={`p-6 bg-white rounded-lg shadow-md grid grid-cols-2 border border-gray-200 ring-2 ring-inset transition-colors duration-200 ease-in-out ${highlightClasses}`}
    >
      <div className="col-span-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-[#8C1D40]">
            {event.event_name}
          </h3>
        </div>

        <div className="space-y-2 mb-4">
          {event.event_location && (
            <div>
              <span className="font-semibold text-gray-700">Location: </span>
              <span className="text-gray-600">{event.event_location}</span>
            </div>
          )}
          {event.event_date && (
            <div>
              <span className="font-semibold text-gray-700">Date/Time: </span>
              <span className="text-gray-600">
                {formatDateTime(event.event_date, event.event_time) || "no date"}
              </span>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4">
          {event.event_description}
        </p>
      </div>

      <div className="col-span-1">
        <div className="flex justify-end items-start mb-3 space-x-2">
          {/* Add Delete button if onDelete prop is provided */}
          {isAdmin && onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-100"
              title="Delete this event"
            >
              <Trash2 size={18} />
            </button>
          )}
          {/* Add Announce button if onAnnounce prop is provided */}
          {onAnnounce && !isPast && (
            <button
              onClick={onAnnounce}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
              title="Announce this event"
            >
              <Megaphone size={18} className="mr-1" /> 
            </button>
          )}
          {isAdmin && onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <MoreHorizontal size={18} />
            </button>
          )}
        </div>
        {event.event_hours_type && (
          <div>
            <span className="font-semibold text-gray-700">Hours: </span>
            <span className="text-gray-600">
              {event.event_hours} {event.event_hours_type}
            </span>
          </div>
        )}

        {event.sponsors_attending && (
          <div>
            <span className="font-semibold text-gray-700">Sponsors: </span>
            <span className="text-gray-600">
              {event.sponsors_attending.join(", ")}
            </span>
          </div>
        )}
      </div>

      {!isPast && isLoggedIn && !loading && (
        <div className="col-span-2 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 mt-4">
          {(isMember || isSponsor) && !hideRSVP && (
            <div className="w-full sm:w-40">
              <EventRSVP 
                eventId={event.id} 
                eventRSVPed={event.event_rsvped || []} 
                eventName={event.event_name}
              />
            </div>
          )}
          {isMember && (
            <div className="w-full sm:w-40">
              <EventCheckIn
                eventId={event.id}
                eventAttending={event.event_attending || []}
                eventRSVPed={event.event_rsvped || []}
                eventDate={event.event_date}
                eventTime={event.event_time}
                eventHours={event.event_hours}
                checkInWindowMinutes={event.check_in_window}
              />
            </div>
          )}
        </div>
      )}

      {/* Combined RSVPs and Attendees section */}
      {!loading && isAdmin && (
        <div className="col-span-2 mt-4 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setSelectedEntityMenu(selectedEntityMenu === "attendees" ? null : "attendees")}
              className="flex-1 flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 text-left rounded-md focus:outline-none"
              style={{ minWidth: 0 }}
              type="button"
            >
              <div className="flex-1 flex items-center min-w-0">
                <h4 className="text-xl font-semibold text-gray-900 truncate">RSVPs and Attendees</h4>
              </div>
              <div className="flex items-center flex-shrink-0 ml-2">
                <span className="text-sm text-gray-500 mr-3 whitespace-nowrap">
                  {rsvps.length} RSVPs, {attendees.length} Attendees
                </span>
                {selectedEntityMenu === "attendees" ? (
                  <ChevronUp size={20} className="text-gray-600" />
                ) : (
                  <ChevronDown size={20} className="text-gray-600" />
                )}
              </div>
            </button>
          </div>

          {selectedEntityMenu === "attendees" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* RSVPs Section */}
              <div className="w-full md:border-r md:border-gray-200 md:pr-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-2xl font-semibold text-left">RSVPs</h4>
                  {!isPast && isAdmin && (
                    <button
                      onClick={() => setShowAddRSVPModal(true)}
                      className="px-3 py-1 rounded-md bg-bapred text-white hover:bg-bapreddark focus:outline-none text-sm font-medium"
                      title="Add RSVP"
                      type="button"
                    >
                      <Plus size={18} className="inline-block align-middle mr-1" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  )}
                </div>
                {rsvps.length > 0 ? (
                  <EmailList
                    emails={rsvps.map(rsvp => ({ email: rsvp.email, name: rsvp.name }))}
                    userType="admin"
                    clickable={false}
                    onDelete={handleDeleteRSVP}
                  />
                ) : (
                  <span className="text-gray-600">No RSVPs</span>
                )}
              </div>

              {/* Attendees Section */}
              <div className="w-full md:pl-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-2xl font-semibold text-left">Attendees</h4>
                  <button
                    onClick={() => setShowAddAttendeeModal(true)}
                    className="px-3 py-1 rounded-md bg-bapred text-white hover:bg-bapreddark focus:outline-none text-sm font-medium"
                    title="Add Attendee"
                    type="button"
                  >
                    <Plus size={18} className="inline-block align-middle mr-1" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
                {attendees.length > 0 ? (
                  <EmailList
                    emails={attendees.map(attendee => ({ email: attendee.email, name: attendee.name }))}
                    userType="admin"
                    clickable={false}
                    onDelete={handleDeleteAttendee}
                  />
                ) : (
                  <span className="text-gray-600">No attendees</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add RSVP Modal */}
      <Modal
        isOpen={showAddRSVPModal}
        onClose={() => setShowAddRSVPModal(false)}
        title="Add RSVP to Event"
        confirmText="Add RSVP"
        cancelText="Cancel"
        size="lg"
      >
        <form onSubmit={e => { e.preventDefault(); handleAddRSVP(); }} className="space-y-4 min-h-[500px]">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member(s)
            </label>
            <div className="relative" onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' && filteredMembers.length > 0) {
                e.preventDefault();
                handleSelectMember(filteredMembers[0]);
              }
            }}>
              <SearchInput
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search members by name or email..."
              />
            </div>
            {filteredMembers.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
                {filteredMembers.slice(0, 5).map((member, idx) => (
                  <li
                    key={member.email}
                    className={`px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 transition-colors ${idx !== Math.min(filteredMembers.length, 5) - 1 ? 'border-b border-gray-100' : ''}`}
                    onClick={() => handleSelectMember(member)}
                  >
                    <span className="font-medium">{member.name}</span>
                    <span className="text-gray-500 ml-2">{member.email}</span>
                  </li>
                ))}
              </ul>
            )}
            {/* Selected members list */}
            {selectedMembers.length > 0 && (
              <div className="mt-3 w-full flex flex-col gap-2">
                {selectedMembers.map(member => (
                  <div
                    key={member.email}
                    className="w-full border border-bapgray rounded-md px-4 py-2 flex justify-between items-center bg-white"
                  >
                    <div>
                      <div className="font-medium text-gray-800">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                    <button
                      type="button"
                      className="text-bapred hover:text-bapreddark font-bold text-lg ml-2 focus:outline-none"
                      onClick={() => handleRemoveSelectedMember(member.email)}
                      aria-label={`Remove ${member.email}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
              disabled={selectedMembers.length === 0 || isAddingRSVP}
            >
              {isAddingRSVP ? "Adding..." : "Add RSVP"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Attendee Modal */}
      <Modal
        isOpen={showAddAttendeeModal}
        onClose={() => setShowAddAttendeeModal(false)}
        title="Add Attendee to Event"
        confirmText="Add Attendee"
        cancelText="Cancel"
        size="lg"
      >
        <form onSubmit={e => { e.preventDefault(); handleAddAttendee(); }} className="space-y-4 min-h-[500px]">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member(s)
            </label>
            <div className="relative" onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' && filteredMembers.length > 0) {
                e.preventDefault();
                handleSelectMember(filteredMembers[0]);
              }
            }}>
              <SearchInput
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search members by name or email..."
              />
            </div>
            {filteredMembers.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
                {filteredMembers.slice(0, 5).map((member, idx) => (
                  <li
                    key={member.email}
                    className={`px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 transition-colors ${idx !== Math.min(filteredMembers.length, 5) - 1 ? 'border-b border-gray-100' : ''}`}
                    onClick={() => handleSelectMember(member)}
                  >
                    <span className="font-medium">{member.name}</span>
                    <span className="text-gray-500 ml-2">{member.email}</span>
                  </li>
                ))}
              </ul>
            )}
            {/* Selected members list */}
            {selectedMembers.length > 0 && (
              <div className="mt-3 w-full flex flex-col gap-2">
                {selectedMembers.map(member => (
                  <div
                    key={member.email}
                    className="w-full border border-bapgray rounded-md px-4 py-2 flex justify-between items-center bg-white"
                  >
                    <div>
                      <div className="font-medium text-gray-800">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                    <button
                      type="button"
                      className="text-bapred hover:text-bapreddark font-bold text-lg ml-2 focus:outline-none"
                      onClick={() => handleRemoveSelectedMember(member.email)}
                      aria-label={`Remove ${member.email}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
              disabled={selectedMembers.length === 0 || isAddingAttendee}
            >
              {isAddingAttendee ? "Adding..." : "Add Attendee"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
