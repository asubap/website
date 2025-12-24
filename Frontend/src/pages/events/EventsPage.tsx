import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { EventCard } from "../../components/event/EventCard";
import { useAuth } from "../../context/auth/authProvider";
import { Event } from "../../types";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { isEventInSession } from "../../components/event/EventCheckIn";
import CreateEventModal from "../../components/admin/CreateEventModal";
import EditEventModal from "../../components/admin/EditEventModal";
import { useToast } from "../../context/toast/ToastContext";

import ConfirmationModal from "../../components/common/ConfirmationModal";

import { getNavLinks } from "../../components/nav/NavLink";
import SearchInput from "../../components/common/SearchInput";

const EventsPage: React.FC = () => {
  const { session, role, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const eventRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const location = useLocation();

  // Add state for event editing
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  // Add state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  // Add state for announce confirmation modal
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [eventToAnnounce, setEventToAnnounce] = useState<Event | null>(null);

  // State for pagination/load more
  const PAST_EVENTS_INCREMENT = 3;
  const [visiblePastEventsCount, setVisiblePastEventsCount] = useState(
    PAST_EVENTS_INCREMENT
  );

  // Add search state
  const [searchQuery, setSearchQuery] = useState("");

  // Add event handling functions
  const handleEventCreated = () => {
    window.location.reload();
  };

  const handleEventUpdated = async () => {
    try {
      // Refresh events
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/events`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );
      const data = await response.json();
      setAllEvents(data);
      showToast("Event updated successfully", "success");
    } catch (error) {
      console.error("Error updating event:", error);
      showToast("Failed to update event", "error");
    }
    setShowEditEventModal(false);
    setEventToEdit(null);
  };

  const handleEditEventClick = (event: Event) => {
    setEventToEdit(event);
    setShowEditEventModal(true);
  };

  const handleDeleteEventClick = (event: Event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete || !session?.access_token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/events/delete-event`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            event_id: eventToDelete.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // Remove the deleted event from the local state
      setAllEvents(allEvents.filter((event) => event.id !== eventToDelete.id));

      showToast("Event deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast("Failed to delete event", "error");
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  const handleAnnounceEvent = async (event: Event) => {
    setEventToAnnounce(event);
    setShowAnnounceModal(true);
  };

  const handleAnnounceConfirm = async () => {
    if (!eventToAnnounce || !session?.access_token) return;

    try {
      if (role !== "e-board") {
        showToast(
          "You must be logged in to announce events and be part of Eboard",
          "error"
        );
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/events/send-event`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            id: eventToAnnounce.id,
            event_name: eventToAnnounce.event_name,
            event_description: eventToAnnounce.event_description,
            event_location: eventToAnnounce.event_location,
            event_lat: eventToAnnounce.event_lat,
            event_long: eventToAnnounce.event_long,
            event_date: eventToAnnounce.event_date,
            event_time: eventToAnnounce.event_time,
            event_rsvped: eventToAnnounce.event_rsvped,
            event_attending: eventToAnnounce.event_attending,
            event_hours: eventToAnnounce.event_hours,
            event_hours_type: eventToAnnounce.event_hours_type,
            sponsors_attending: eventToAnnounce.sponsors_attending,
            check_in_window: eventToAnnounce.check_in_window,
            rsvped_users: eventToAnnounce.rsvped_users
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to announce event");
      }

      showToast("Event announcement sent successfully!", "success");
    } catch (error) {
      console.error("Error announcing event:", error);
      showToast("Failed to announce event", "error");
    } finally {
      setShowAnnounceModal(false);
      setEventToAnnounce(null);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const endpoint = session?.access_token
          ? `${import.meta.env.VITE_BACKEND_URL}/events`
          : `${import.meta.env.VITE_BACKEND_URL}/events/public`;
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        setLoading(true);
        const response = await fetch(endpoint, { method: "GET", headers });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [session, authLoading]);

  // Effect 2: Handle highlighting when location state changes or loading finishes
  useEffect(() => {
    const highlightEventId = location.state?.highlightEventId;
    if (!loading && highlightEventId) {
      window.history.replaceState(
        { ...location.state, highlightEventId: null },
        ""
      );
      const timer = setTimeout(() => {
        const element = eventRefs.current.get(highlightEventId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightedId(highlightEventId);
          setTimeout(() => setHighlightedId(null), 2000);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state, loading]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getEventDateTime = (event: Event) =>
    new Date(`${event.event_date}T${event.event_time || "00:00:00"}`);

  // Filter events based on search query
  const filteredEvents = allEvents.filter((event) => {
    const query = searchQuery.toLowerCase();
    return (
      event.event_name.toLowerCase().includes(query) ||
      (event.event_location &&
        event.event_location.toLowerCase().includes(query)) ||
      (event.event_description &&
        event.event_description.toLowerCase().includes(query))
    );
  });

  const inSessionEvents = filteredEvents.filter((event) =>
    isEventInSession(event.event_date, event.event_time || '00:00:00', event.event_hours || 0)
  );
  const upcomingEvents = filteredEvents
    .filter(
      (event) =>
        !isEventInSession(
          event.event_date,
          event.event_time || '00:00:00',
          event.event_hours || 0
        ) && getEventDateTime(event) >= today
    )
    .sort(
      (a, b) => getEventDateTime(a).getTime() - getEventDateTime(b).getTime()
    );
  const pastEvents = filteredEvents
    .filter(
      (event) =>
        !isEventInSession(
          event.event_date,
          event.event_time || '00:00:00',
          event.event_hours || 0
        ) && getEventDateTime(event) < today
    )
    .sort(
      (a, b) => getEventDateTime(b).getTime() - getEventDateTime(a).getTime()
    );

  const handleLoadMorePastEvents = () => {
    setVisiblePastEventsCount((prevCount) => prevCount + PAST_EVENTS_INCREMENT);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        links={getNavLinks(!!session)}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        isLogged={Boolean(session)}
        role={role}
      />
      <main className="flex-grow p-8 pt-32 px-8 sm:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-outfit font-bold text-bapred mb-6 text-center">
            Events
          </h1>
          {/* Search Bar */}
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by name, location, or description..."
            containerClassName="mb-8"
          />
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Events In-Session</h2>
            <div className="space-y-4">
              {loading ? (
                <LoadingSpinner text="Loading events in session..." size="md" />
              ) : inSessionEvents.length > 0 ? (
                inSessionEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={false}
                    isHighlighted={event.id === highlightedId}
                    registerRef={(el: HTMLDivElement | null) => {
                      if (el) eventRefs.current.set(event.id, el);
                      else eventRefs.current.delete(event.id);
                    }}
                    hideRSVP={true}
                    onEdit={
                      role === "e-board"
                        ? () => handleEditEventClick(event)
                        : undefined
                    }
                    onAnnounce={
                      role === "e-board"
                        ? () => handleAnnounceEvent(event)
                        : undefined
                    }
                    onDelete={
                      role === "e-board"
                        ? () => handleDeleteEventClick(event)
                        : undefined
                    }
                  />
                ))
              ) : (
                <p className="text-gray-500">No events in session</p>
              )}
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              {role === "e-board" && (
                <button
                  className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
                  onClick={() => setShowCreateEventModal(true)}
                >
                  + <span className="hidden md:inline">New </span>Event
                </button>
              )}
            </div>
            <div className="space-y-4">
              {loading ? (
                <LoadingSpinner text="Loading upcoming events..." size="md" />
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={false}
                    isHighlighted={event.id === highlightedId}
                    registerRef={(el: HTMLDivElement | null) => {
                      if (el) eventRefs.current.set(event.id, el);
                      else eventRefs.current.delete(event.id);
                    }}
                    onEdit={
                      role === "e-board"
                        ? () => handleEditEventClick(event)
                        : undefined
                    }
                    onAnnounce={
                      role === "e-board"
                        ? () => handleAnnounceEvent(event)
                        : undefined
                    }
                    onDelete={
                      role === "e-board"
                        ? () => handleDeleteEventClick(event)
                        : undefined
                    }
                  />
                ))
              ) : (
                <p className="text-gray-500">No upcoming events</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Past Events</h2>
            <div className="space-y-4">
              {loading ? (
                <LoadingSpinner text="Loading past events..." size="md" />
              ) : pastEvents.length > 0 ? (
                pastEvents.slice(0, visiblePastEventsCount).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={true}
                    isHighlighted={event.id === highlightedId}
                    registerRef={(el: HTMLDivElement | null) => {
                      if (el) eventRefs.current.set(event.id, el);
                      else eventRefs.current.delete(event.id);
                    }}
                    onEdit={
                      role === "e-board"
                        ? () => handleEditEventClick(event)
                        : undefined
                    }
                    onDelete={
                      role === "e-board"
                        ? () => handleDeleteEventClick(event)
                        : undefined
                    }
                  />
                ))
              ) : (
                <p className="text-gray-500">No past events</p>
              )}
            </div>
            {/* Load More Button */}
            {!loading && pastEvents.length > visiblePastEventsCount && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMorePastEvents}
                  className="px-6 py-2 bg-bapred text-white text-sm font-medium rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bapred"
                >
                  Load More Past Events
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer backgroundColor="#AF272F" />

      {/* Event Creation Modal */}
      {showCreateEventModal && (
        <CreateEventModal
          onClose={() => setShowCreateEventModal(false)}
          onEventCreated={handleEventCreated}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && eventToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setEventToDelete(null);
          }}
          onConfirm={handleDeleteEvent}
          title="Delete Event"
          message={`Are you sure you want to delete the event "${eventToDelete.event_name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {/* Announce Confirmation Modal */}
      {showAnnounceModal && eventToAnnounce && (
        <ConfirmationModal
          isOpen={showAnnounceModal}
          onClose={() => {
            setShowAnnounceModal(false);
            setEventToAnnounce(null);
          }}
          onConfirm={handleAnnounceConfirm}
          title="Announce Event"
          message={`Are you sure you want to announce the event "${eventToAnnounce.event_name}"?`}
          confirmText="Announce"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default EventsPage;
