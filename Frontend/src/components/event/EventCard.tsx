import React from "react";
import EventCheckIn from "./EventCheckIn";
import EventRSVP from "./EventRSVP";

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
      
      {!isPast && (
        <div className="flex justify-end space-x-4">
          <div className="w-40">
            <EventRSVP eventId={eventId} />
          </div>
          <div className="w-40">
            <EventCheckIn eventId={eventId} />
          </div>
        </div>
      )}
    </div>
  );
};