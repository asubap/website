import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { EventCard } from "../../components/event/EventCard";
import { useAuth } from "../../context/auth/authProvider";
import { useNavigate } from "react-router-dom";

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

const AuthEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:3000/events", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    
    if (session?.access_token) {
      fetchEvents();
    } else {
      navigate('/login');
    }
  }, [session, navigate]);

  const navLinks = [
    { name: "About Us", href: "/about" },
    { name: "Our Sponsors", href: "/sponsors" },
    { name: "Events", href: "/events" },
    { name: "Membership", href: "/membership" },
    { name: "Log In", href: "/login" },
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
        links={navLinks}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
        isLogged={!!session}
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

export default AuthEventsPage;