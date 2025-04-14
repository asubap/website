import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { EventCard } from "../../components/event/EventCard";
import { useAuth } from "../../context/auth/authProvider";
import { Event } from "../../types";

const EventsPage: React.FC = () => {
  const { session } = useAuth();
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  const isPastDate = (dateString: string): boolean => {
    // Parse the input date string into a Date object
    const inputDate = new Date(dateString);
  
    // Get the current date and reset its time to midnight
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison
  
    // Compare the input date with the current date
    return inputDate < currentDate;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Choose endpoint based on authentication status
        const endpoint = session?.access_token 
          ? "https://asubap-backend.vercel.app/events"
          : "https://asubap-backend.vercel.app/events/public";
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };

        // Add authorization header if authenticated
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        fetch(endpoint, {
          method: "GET",
          headers: headers,
        }).then((response) => response.json())
          .then((data) => {
            console.log(data); 
            setPastEvents(data.filter((event: Event) => isPastDate(event.event_date)));
            setUpcomingEvents(data.filter((event: Event) => !isPastDate(event.event_date)));
        })
          .catch((error) => console.error("Error fetching role:", error))

        console.log("Past Events: " + pastEvents);
        console.log("Upcoming Events: " + upcomingEvents);
  
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []); // Re-fetch when session changes

  let navLinks;

  if (session) {
    // Links for logged-in users
    navLinks = [
      { name: "Network", href: "/network" },
      { name: "Events", href: "/events" },
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
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={false}
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
              {pastEvents.length > 0 ? (
                pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={true}
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
