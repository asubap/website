import React, { useEffect } from "react";
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
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isPast,
  isHighlighted,
  registerRef,
  hideRSVP = false,
}) => {
  const { session, role, loading } = useAuth();

  useEffect(() => {
    console.log("Auth state:", {
      session: !!session,
      role,
      loading,
      roleType: typeof role,
    });
  }, [session, role, loading]);

  const formatDateTime = (date?: string, time?: string | null) => {
    if (!date) return null;
    const eventDate = new Date(date);
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return time ? `${formattedDate} at ${time}` : formattedDate;
  };

  // Role checking logic - Check for string role names
  const isMember = role === "general-member" || role === "admin";
  const isSponsor = role === "sponsor";
  const isLoggedIn = !!session;

  // Debug log for role checks
  console.log("Role checks (updated):", {
    rawRole: role,
    isMember,
    isSponsor,
    isLoggedIn,
    shouldShowButtons: !isPast && isLoggedIn && !loading,
  });

  // Define highlight classes using Tailwind ring utility - focusing on color transition
  const highlightClasses = isHighlighted
    ? "ring-bapred" // Apply red ring color when highlighted
    : "ring-transparent"; // Use transparent ring color when not highlighted

  return (
    <div
      ref={registerRef}
      // Apply base styles, border, always-on ring-2/inset, transition-colors, and conditional ring color
      className={`p-6 bg-white rounded-lg shadow-md grid grid-cols-2 border border-gray-200 ring-2 ring-inset transition-colors duration-200 ease-in-out ${highlightClasses}`}
    >
      <div className="col-span-1">
        <h3 className="text-xl font-semibold mb-3 text-[#8C1D40]">
          {event.event_name}
        </h3>

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
                {formatDateTime(event.event_date, event.event_time)}
              </span>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4">
          {event.event_description || "No description available"}
        </p>
      </div>

      <div className="col-span-1">
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
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
