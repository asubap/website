import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/auth/authProvider";
import { EventCard } from "../event/EventCard";
import { Event } from "../../types";
import { isEventInSession } from "../event/EventCheckIn";

const getEventDateTime = (event: Event) =>
  new Date(`${event.event_date}T${event.event_time || '00:00:00'}`);

interface EventMemberProps {
  eventAttendance?: any[];
}

const EventMember: React.FC<EventMemberProps> = ({ eventAttendance = [] }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { session } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!session?.access_token) return;

        const res = await fetch(`${BACKEND_URL}/events`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          credentials: "include",
        });

        const data = await res.json();

        // Sort events by date
        const sortedEvents = data.sort(
          (a: Event, b: Event) =>
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        );

        setEvents(sortedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [session, BACKEND_URL]);

  // Split events into in-session, upcoming, and past
  const today = new Date();

  const inSessionEvents = events.filter(event => isEventInSession(event.event_date, event.event_time, event.event_hours));
  const upcomingEvents = events
    .filter(event => !isEventInSession(event.event_date, event.event_time, event.event_hours) && getEventDateTime(event) >= today)
    .sort((a, b) => getEventDateTime(a).getTime() - getEventDateTime(b).getTime());

  return (
    <div className="w-full lg:w-1/2">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Events In-Session
      </h2>
      <div className="overflow-y-auto pr-2 sm:pr-4 mb-8 max-h-[600px] sm:max-h-[400px] space-y-4">
        {inSessionEvents.length > 0 ? (
          inSessionEvents.map((event) => (
            <EventCard key={event.id} event={event} isPast={false} hideRSVP={true} />
          ))
        ) : (
          <p className="text-gray-500">No events in session</p>
        )}
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Upcoming Events
      </h2>

      <div className="overflow-y-auto pr-2 sm:pr-4 mb-8 max-h-[600px] sm:max-h-[400px] space-y-4">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} isPast={false} />
          ))
        ) : (
          <p className="text-gray-500">No upcoming events</p>
        )}
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Attended Events
      </h2>

      <div className="overflow-y-auto pr-2 sm:pr-4 max-h-[600px] sm:max-h-[400px] space-y-4">
        {eventAttendance && eventAttendance.length > 0 ? (
          eventAttendance.map((attendedEvent, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {attendedEvent.event_name || 'Event'}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {attendedEvent.event_description || 'No description available'}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {attendedEvent.event_date && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    Date: {new Date(attendedEvent.event_date).toLocaleDateString()}
                  </span>
                )}
                {attendedEvent.event_hours && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    Hours: {attendedEvent.event_hours}
                  </span>
                )}
                {attendedEvent.event_hours_type && (
                  <span className="bg-green-100 px-2 py-1 rounded">
                    Type: {attendedEvent.event_hours_type}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No attended events</p>
        )}
      </div>
    </div>
  );
};

export default EventMember;
