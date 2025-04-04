import React from "react";
import EventCheckIn from "./EventCheckIn";

interface EventCardProps {
  title: string;
  description: string | null;
  eventId: string;
  isPast?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  description,
  eventId,
  isPast = false,
}) => {
  return (
    <div className="p-6 rounded-[14.54px] border-[1.53px] border-black">
      <div className="text-black text-[32px] font-bold mb-2">{title}</div>
      <div className="text-black text-base mb-6">
        <span>Description - </span>
        <span>{description || 'No description available'}</span>
      </div>
      <div className="flex flex-col gap-4">
        {!isPast ? (
          <>
            <div className="flex gap-4 justify-end">
              <button className="border text-[#AF272F] text-base px-8 py-2 rounded-[10px] border-solid border-[#AF272F]">
                View
              </button>
              <button className="bg-[#AF272F] text-white text-base px-8 py-2 rounded-[10px]">
                Edit
              </button>
            </div>
            <EventCheckIn eventId={eventId} />
          </>
        ) : (
          <div className="flex justify-end">
            <button className="bg-[#AF272F] text-white text-base px-8 py-2 rounded-[10px]">
              Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );
};