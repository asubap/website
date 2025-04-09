import React, { useEffect } from "react";
import EventCheckIn from "./EventCheckIn";
import EventRSVP from "./EventRSVP";
import { useAuth } from "../../context/auth/authProvider";

interface EventCardProps {
  eventId: string;
  title: string;
  description: string | null;
  isPast: boolean;
  location?: string | null;
  date?: string;
  time?: string | null;
}

export const EventCard: React.FC<EventCardProps> = ({
  eventId,
  title,
  description,
  isPast,
  location,
  date,
  time
}) => {
  const { session, role, loading } = useAuth();

  useEffect(() => {
    console.log('Auth state:', {
      session: !!session,
      role,
      loading,
      roleType: typeof role
    });
  }, [session, role, loading]);

  const formatDateTime = (date?: string, time?: string | null) => {
    if (!date) return null;
    const eventDate = new Date(date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return time ? `${formattedDate} at ${time}` : formattedDate;
  };

  // Role checking logic - Check for string role names
  const isMember = Array.isArray(role) && role.includes("general-member"); // Role ID 3
  const isSponsor = Array.isArray(role) && role.includes("sponsor");      // Role ID 2
  const isLoggedIn = !!session;

  // Debug log for role checks
  console.log('Role checks (updated):', {
    rawRole: role,
    isMember,
    isSponsor,
    isLoggedIn,
    shouldShowButtons: !isPast && isLoggedIn && !loading
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold mb-3 text-[#8C1D40]">{title}</h3>
      
      <div className="space-y-2 mb-4">
        {location && (
          <div>
            <span className="font-semibold text-gray-700">Location: </span>
            <span className="text-gray-600">{location}</span>
          </div>
        )}
        {date && (
          <div>
            <span className="font-semibold text-gray-700">Date/Time: </span>
            <span className="text-gray-600">{formatDateTime(date, time)}</span>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4">
        {description || 'No description available'}
      </p>
      
      {!isPast && isLoggedIn && !loading && (
        <div className="flex justify-end space-x-4">
          {(isMember || isSponsor) && (
            <div className="w-40">
              <EventRSVP eventId={eventId} />
            </div>
          )}
          {isMember && (
            <div className="w-40">
              <EventCheckIn eventId={eventId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};