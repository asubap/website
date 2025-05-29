import React from "react";
import { Event } from "../../types";
import LoadingSpinner from "../common/LoadingSpinner";
import { EventListShort } from "../event/EventListShort";

interface AdminEventsSectionProps {
  upcomingEvents: Event[];
  pastEvents: Event[];
  loadingEvents: boolean;
  onCreateEvent: () => void;
  onEditEvent: (event: Event) => void;
}

const AdminEventsSection: React.FC<AdminEventsSectionProps> = ({
  upcomingEvents,
  pastEvents,
  loadingEvents,
  onCreateEvent,
  onEditEvent,
}) => (
  <div className="space-y-8">
    <div>
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-semibold">Upcoming Events</h2>
        <button
          className="ml-auto px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
          onClick={onCreateEvent}
        >
          + <span className="hidden md:inline">New </span>Event
        </button>
      </div>
      {loadingEvents ? (
        <LoadingSpinner text="Loading upcoming events..." size="md" />
      ) : upcomingEvents.length > 0 ? (
        <EventListShort events={upcomingEvents} onEdit={onEditEvent} />
      ) : (
        <p className="text-gray-500 text-sm">No upcoming events scheduled.</p>
      )}
    </div>
    <div>
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-semibold">Past Events</h2>
      </div>
      <div className="max-h-72 overflow-y-auto pr-2">
        {loadingEvents ? (
          <LoadingSpinner text="Loading events..." size="md" />
        ) : pastEvents.length > 0 ? (
          <EventListShort events={pastEvents} onEdit={onEditEvent} />
        ) : (
          <p className="text-gray-500 text-sm">No past events found.</p>
        )}
      </div>
    </div>
  </div>
);

export default AdminEventsSection;
