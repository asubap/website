import React, { useState, useEffect } from "react";
import EventCheckIn from "./EventCheckIn";
import EventRSVP from "./EventRSVP";
import { useAuth } from "../../context/auth/authProvider";
import { Event } from "../../types";

interface EventCardProps {
  event: Event;
  isPast: boolean;
  isHighlighted?: boolean;
  registerRef?: (element: HTMLDivElement | null) => void;
  hideRSVP?: boolean;
  onEdit?: () => void;
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
}) => {
  const { session, role, loading } = useAuth();
  const [attendees, setAttendees] = useState<{id: string, name: string}[]>([]);
  const [rsvps, setRSVPs] = useState<{id: string, name: string}[]>([]);

  // Role checking logic - Check for string role names
  const isMember = role === "general-member" || role === "admin";
  const isSponsor = role === "sponsor";
  const isLoggedIn = !!session;
  const isAdmin = role === "e-board";

  // Define highlight classes using Tailwind ring utility - focusing on color transition
  const highlightClasses = isHighlighted
    ? "ring-bapred" // Apply red ring color when highlighted
    : "ring-transparent"; // Use transparent ring color when not highlighted

  useEffect(() => {
    const fetchAttendees = async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/member-info/get-members-info-by-ids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ user_ids: event.event_attending }),
      });
      const data = await response.json();
      setAttendees(data);
    };

    const fetchRSVPs = async () => {
      console.log(event.event_rsvped);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/member-info/get-members-info-by-ids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ user_ids: event.event_rsvped }),
      });
      const data = await response.json();
      console.log(data);
      setRSVPs(data);
    };

    if (event.event_attending) {
      fetchAttendees();
    }
    if (event.event_rsvped) {
      fetchRSVPs();
    }
  }, [event]);

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
        <div className="flex justify-end items-start mb-3">
          {isAdmin && onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm bg-bapred text-white rounded hover:bg-bapreddark transition-colors"
            >
              Edit
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

      {/* show admins the list of attendees */}
      {!loading && isAdmin && (
        <div className="col-span-2 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 mt-4">
          <div className="w-full sm:w-40">
            <div>
              <span className="font-semibold text-gray-700">Attendees: </span>
              <span className="text-gray-600">
                {/* show the list of attendees */}
                {attendees.length > 0 ? (
                  attendees.map((attendee) => (
                    attendee && (
                      <div key={attendee.id}>
                        {attendee.name}
                      </div>
                    )
                  ))
                ) : (
                  <div>
                    No attendees
                  </div>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* show admins list of rsvps for not past events */}
      {!loading && isAdmin && (
        <div className="col-span-2 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 mt-4">
          <div className="w-full sm:w-40">
            <div>
              <span className="font-semibold text-gray-700">RSVPs: </span>
              <span className="text-gray-600">
                {rsvps.length > 0 ? (
                  rsvps.map((rsvp) => (
                    rsvp && (
                      <div key={rsvp.id}>
                        {rsvp.name}
                      </div>
                    )
                  ))
                ) : (
                  <span className="text-gray-400">No RSVPs</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
