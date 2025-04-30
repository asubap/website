import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { EventCard } from "../../components/event/EventCard";
import { useAuth } from "../../context/auth/authProvider";
import { Event } from "../../types";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const EventsPage: React.FC = () => {
  const { session } = useAuth();
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const eventRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const location = useLocation();

  const isPastDate = (dateString: string): boolean => {
    // Parse the input date string into a Date object
    const inputDate = new Date(dateString);

    // Get the current date and reset its time to midnight
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

    // Compare the input date with the current date
    return inputDate < currentDate;
  };

  // Effect 1: Fetch Events on mount or session change
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

        setPastEvents(
          data.filter((event: Event) => isPastDate(event.event_date))
        );
        setUpcomingEvents(
          data.filter((event: Event) => !isPastDate(event.event_date))
        );
      } catch (error) {
        console.error("Error fetching events:", error);
        // Handle error state if needed
        setPastEvents([]); // Clear data on error
        setUpcomingEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [session]); // Depend only on session for re-fetching

  // Effect 2: Handle highlighting when location state changes or loading finishes
  useEffect(() => {
    const highlightEventId = location.state?.highlightEventId;

    // Only proceed if not loading and we have an ID to highlight
    if (!loading && highlightEventId) {
      console.log(
        "Highlighting effect triggered (loading finished): ID",
        highlightEventId
      );

      // Clear the state immediately after detecting it to prevent re-trigger on back navigation
      window.history.replaceState(
        { ...location.state, highlightEventId: null },
        ""
      );

      // Use setTimeout to ensure DOM is ready after state update
      const timer = setTimeout(() => {
        const element = eventRefs.current.get(highlightEventId);
        if (element) {
          console.log("Element found, scrolling and highlighting:", element);
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightedId(highlightEventId);
          // Clear highlight after a delay
          setTimeout(() => setHighlightedId(null), 2000); // Highlight for 2 seconds
        } else {
          console.log("Element not found in refs for ID:", highlightEventId);
        }
      }, 100); // Increased delay slightly just in case

      // Cleanup the main timer if effect re-runs or component unmounts
      return () => clearTimeout(timer);
    }

    // No cleanup needed for the inner setTimeout, it handles itself
  }, [location.state, loading]); // Now depends on loading status correctly

  let navLinks;

  if (session) {
    // Links for logged-in users
    navLinks = [
      { name: "Network", href: "/network" },
      { name: "Events", href: "/events" },
      { name: "Resources", href: "/resources" },
      { name: "Dashboard", href: "/admin" },
    ];
  } else {
    // Links for logged-out users
    navLinks = [
      { name: "About Us", href: "/about" },
      { name: "Our Sponsors", href: "/sponsors" },
      { name: "Events", href: "/events" },
      { name: "Membership", href: "/membership" },
      { name: "Log In", href: "/login" },
    ];
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        links={navLinks} // Pass the conditionally defined links
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        isLogged={Boolean(session)} // Let Navbar know the auth state
      />
      <main className="flex-grow p-8 pt-32">
        <div className="max-w-6xl mx-auto">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
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
                pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={true}
                    isHighlighted={event.id === highlightedId}
                    registerRef={(el: HTMLDivElement | null) => {
                      if (el) eventRefs.current.set(event.id, el);
                      else eventRefs.current.delete(event.id);
                    }}
                  />
                ))
              ) : (
                <p className="text-gray-500">No past events</p>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer backgroundColor="#AF272F" />
    </div>
  );
};

export default EventsPage;
