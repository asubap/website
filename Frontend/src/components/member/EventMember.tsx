import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/auth/authProvider";
import { EventCard } from "../event/EventCard";

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

const EventMember: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { session } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!session?.access_token) return;

        const res = await fetch(`${BACKEND_URL}/events`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          credentials: 'include'
        });
        
        const data = await res.json();
        
        // Sort events by date
        const sortedEvents = data.sort((a: Event, b: Event) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [session, BACKEND_URL]);

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
    <div className="w-full lg:w-1/2">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Upcoming Events</h2>

      <div className="overflow-y-auto pr-2 sm:pr-4 mb-8 max-h-[400px] space-y-4">
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

      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Past Events</h2>

      <div className="overflow-y-auto pr-2 sm:pr-4 max-h-[400px] space-y-4">
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
    </div>
  );
};

export default EventMember;