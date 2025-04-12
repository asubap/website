import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { EventCard } from "../../components/event/EventCard";
import { useAuth } from "../../context/auth/authProvider";

interface Event {
  id: string;
  name: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  rsvp_users?: string[];
  attending_users?: string[];
}

const EventsPage: React.FC = () => {
  const [events] = useState<Event[]>([]);
  const { session } = useAuth();

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
          })
          .catch((error) => console.error("Error fetching role:", error))
  
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [session]); // Re-fetch when session changes

  // Define standard navigation links
  const navLinks = [
    { name: "About Us", href: "/about" },
    { name: "Our Sponsors", href: "/sponsors" },
    { name: "Events", href: "/events" },
    { name: "Membership", href: "/membership" },
    { name: "Log In", href: "/login" },
    
    // Log In link will be handled by Navbar if not logged in
  ];

  // Split events into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  const pastEvents = events
    .filter(event => new Date(event.date) < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        links={navLinks} // Pass only standard links
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
                    eventId={event.id.toString()}
                    title={event.name}
                    description={event.description}
                    location={event.location}
                    date={event.date}
                    time={event.time}
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
                    eventId={event.id.toString()}
                    title={event.name}
                    description={event.description}
                    location={event.location}
                    date={event.date}
                    time={event.time}
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
