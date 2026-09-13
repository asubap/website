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
import CalendarSubscribeButton from "../../components/event/CalendarSubscribeButton";

const EventsPage: React.FC = () => {
  const { session, role, loading: authLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<string | undefined>(undefined);
  const [rankLoading, setRankLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const eventRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const location = useLocation();

  // Add state for event editing
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  // State for removing a past hidden event from event listings
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [eventToRemove, setEventToRemove] = useState<Event | null>(null);
  const [showBulkRemoveModal, setShowBulkRemoveModal] = useState(false);

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

  // Add hidden events toggle state
  const [showHidden, setShowHidden] = useState(false);

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

  const handleRemoveEventClick = (event: Event) => {
    setEventToRemove(event);
    setShowRemoveModal(true);
  };

  const handleRemoveEvent = async () => {
    if (!eventToRemove || !session?.access_token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/events/archive-event`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            event_id: eventToRemove.id,
          }),
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Failed to remove event");
      }

      setAllEvents((events) => events.filter((event) => event.id !== eventToRemove.id));

      showToast("Event removed successfully", "success");
    } catch (error) {
      console.error("Error removing event:", error);
      showToast(error instanceof Error ? error.message : "Failed to remove event", "error");
    } finally {
      setShowRemoveModal(false);
      setEventToRemove(null);
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
            event_id: eventToAnnounce.id,
            recipient_filter: "rsvped"  // Backend fetches emails from database
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

  // Fetch user's rank once at page level
  useEffect(() => {
    const fetchUserRank = async () => {
      const isAdmin = role === "e-board";

      // If not logged in, admin, or still loading auth, skip rank check
      if (!session?.access_token || !session?.user?.email || isAdmin || authLoading) {
        setRankLoading(false);
        return;
      }

      try {
        setRankLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/member-info/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.rank) {
            setUserRank(data.rank);
          }
        }
      } catch (error) {
        console.error("Error fetching user rank:", error);
      } finally {
        setRankLoading(false);
      }
    };

    fetchUserRank();

    // Refetch rank when window regains focus or becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUserRank();
      }
    };

    const handleFocus = () => {
      fetchUserRank();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [session, role, authLoading]);

  useEffect(() => {
    const controller = new AbortController();

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
        const response = await fetch(endpoint, {
          method: "GET",
          headers,
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllEvents(data);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Error fetching events:", error);
        setAllEvents([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => controller.abort();
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

  const now = new Date();

  const getEventDateTime = (event: Event) =>
    new Date(`${event.event_date}T${event.event_time || "00:00:00"}`);

  const isAdmin = role === "e-board";

  // Filter events based on search query AND hidden status
  const filteredEvents = allEvents.filter((event) => {
    const isHiddenEvent = 'is_hidden' in event && event.is_hidden;

    // 1. Filter by hidden status (admin toggle)
    // Backend already filters out hidden events for non-admin users
    if (showHidden) {
      if (!isHiddenEvent) return false;  // Show only hidden events
    } else {
      if (isHiddenEvent) return false;   // Show only standard events
    }

    // 2. Filter by search query
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
        ) && getEventDateTime(event) >= now
    )
    .sort(
      (a, b) => getEventDateTime(a).getTime() - getEventDateTime(b).getTime()
    );
  const isPastEvent = (event: Event) =>
    !isEventInSession(
      event.event_date,
      event.event_time || '00:00:00',
      event.event_hours || 0
    ) && getEventDateTime(event) < now;
  const pastEvents = filteredEvents
    .filter(isPastEvent)
    .sort(
      (a, b) => getEventDateTime(b).getTime() - getEventDateTime(a).getTime()
    );
  const hasPastHiddenEvents = allEvents.some(
    (event) => 'is_hidden' in event && event.is_hidden && isPastEvent(event)
  );

  const handleLoadMorePastEvents = () => {
    setVisiblePastEventsCount((prevCount) => prevCount + PAST_EVENTS_INCREMENT);
  };

  const handleBulkRemovePastHiddenEvents = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/events/archive-past-hidden`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "Failed to remove past hidden events");
      }

      setAllEvents((events) => events.filter((event) => {
        const hidden = 'is_hidden' in event && event.is_hidden;
        return !(hidden && isPastEvent(event));
      }));
      const count = Number(result?.archived_count || 0);
      showToast(
        `${count} past hidden event${count === 1 ? '' : 's'} removed; current hour totals reset`,
        "success"
      );
    } catch (error) {
      console.error("Error removing past hidden events:", error);
      showToast(error instanceof Error ? error.message : "Failed to remove past hidden events", "error");
    } finally {
      setShowBulkRemoveModal(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        links={getNavLinks(isAuthenticated)}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        isLogged={isAuthenticated}
        role={role}
      />
      <main className="flex-grow p-8 pt-32 px-8 sm:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-outfit font-bold text-bapred mb-6 text-center">
            Events
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="flex-grow">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by name, location, or description..."
              />
            </div>

            <CalendarSubscribeButton />

            {isAdmin && (
              <div className="flex items-center bg-gray-100 p-1 rounded-lg self-end md:self-auto">
                <button
                  onClick={() => setShowHidden(false)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    !showHidden
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setShowHidden(true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    showHidden
                      ? 'bg-white text-bapred shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Hidden
                </button>
              </div>
            )}
          </div>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Events In-Session</h2>
            <div className="space-y-4">
              {loading || rankLoading ? (
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
                    userRank={userRank}
                    rankLoading={rankLoading}
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
              {loading || rankLoading ? (
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
                    userRank={userRank}
                    rankLoading={rankLoading}
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
                  />
                ))
              ) : (
                <p className="text-gray-500">No upcoming events</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="text-2xl font-bold">Past Events</h2>
              {isAdmin && showHidden && hasPastHiddenEvents && (
                <button
                  type="button"
                  onClick={() => setShowBulkRemoveModal(true)}
                  className="px-4 py-2 border border-red-600 text-red-700 text-sm font-medium rounded-md hover:bg-red-50 transition-colors"
                >
                  Remove All Past Hidden Events
                </button>
              )}
            </div>
            <div className="space-y-4">
              {loading || rankLoading ? (
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
                    userRank={userRank}
                    rankLoading={rankLoading}
                    onEdit={
                      role === "e-board"
                        ? () => handleEditEventClick(event)
                        : undefined
                    }
                    onRemove={
                      isAdmin && showHidden
                        ? () => handleRemoveEventClick(event)
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

      {/* Remove Confirmation Modal */}
      {showRemoveModal && eventToRemove && (
        <ConfirmationModal
          isOpen={showRemoveModal}
          onClose={() => {
            setShowRemoveModal(false);
            setEventToRemove(null);
          }}
          onConfirm={handleRemoveEvent}
          title="Remove Past Hidden Event"
          message={`Remove "${eventToRemove.event_name}" from the website and current hour totals? Its attendance history will remain stored.`}
          confirmText="Remove"
          cancelText="Cancel"
        />
      )}

      {showBulkRemoveModal && (
        <ConfirmationModal
          isOpen={showBulkRemoveModal}
          onClose={() => setShowBulkRemoveModal(false)}
          onConfirm={handleBulkRemovePastHiddenEvents}
          title="Remove All Past Hidden Events"
          message="Remove every completed hidden event from the website and reset the hours they contributed for all members? Attendance history will remain stored."
          confirmText="Remove All"
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
