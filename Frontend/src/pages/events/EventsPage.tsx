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
  isPast?: boolean;
}

const EventsPage: React.FC = () => {
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
    } 
    // else {
    //   navigate('/login');
    // }
  }, [session, navigate]);

  const navLinks = [
    { name: "About Us", href: "/about" },
    { name: "Our Sponsors", href: "/sponsors" },
    { name: "Events", href: "/events" },
    { name: "Membership", href: "/membership" },
    { name: "Log In", href: "/login" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        links={navLinks}
        title="Beta Alpha Psi | Beta Tau Chapter"
        backgroundColor="#FFFFFF"
        outlineColor="#AF272F"
      />
      <main className="flex-grow p-8 pt-32 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events && events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              eventId={event.id.toString()}
              title={event.name}
              description={event.description}
              isPast={new Date(event.date) < new Date()}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No events available
          </div>
        )}
      </main>
      <Footer
        backgroundColor="#AF272F"
      />
    </div>
  );
};

export default EventsPage;