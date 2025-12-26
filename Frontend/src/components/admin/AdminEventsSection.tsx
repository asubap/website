import React, { useState } from "react";
import { Event, AdminEvent } from "../../types";
import LoadingSpinner from "../common/LoadingSpinner";
import { EventListShort } from "../event/EventListShort";

interface AdminEventsSectionProps {
  upcomingEvents: Event[];
  pastEvents: Event[];
  loadingEvents: boolean;
  onCreateEvent: () => void;
  onEditEvent: (event: Event) => void;
}

// Type guard for AdminEvent
const isAdminEvent = (event: Event): event is AdminEvent => {
  return 'is_hidden' in event;
};

const AdminEventsSection: React.FC<AdminEventsSectionProps> = ({
  upcomingEvents,
  pastEvents,
  loadingEvents,
  onCreateEvent,
  onEditEvent,
}) => {
  const [viewMode, setViewMode] = useState<'standard' | 'hidden'>('standard');

  const visibleUpcoming = upcomingEvents.filter(e => isAdminEvent(e) && !e.is_hidden);
  const visiblePast = pastEvents.filter(e => isAdminEvent(e) && !e.is_hidden);
  const hiddenEvents = [...upcomingEvents, ...pastEvents].filter(e => isAdminEvent(e) && e.is_hidden);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        {/* Toggle / Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('standard')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'standard'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Standard Events
          </button>
          <button
            onClick={() => setViewMode('hidden')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'hidden'
                ? 'bg-white text-bapred shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Hidden / Buckets
          </button>
        </div>

        <button
          className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors flex-shrink-0"
          onClick={onCreateEvent}
        >
          + <span className="hidden md:inline">New </span>Event
        </button>
      </div>

      {viewMode === 'standard' ? (
        <div className="space-y-8 animate-fadeIn">
          <div>
            <div className="flex items-center mb-2">
              <h2 className="text-2xl font-semibold">Upcoming Events</h2>
            </div>
            {loadingEvents ? (
              <LoadingSpinner text="Loading upcoming events..." size="md" />
            ) : visibleUpcoming.length > 0 ? (
              <EventListShort events={visibleUpcoming} onEdit={onEditEvent} />
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
              ) : visiblePast.length > 0 ? (
                <EventListShort events={visiblePast} onEdit={onEditEvent} />
              ) : (
                <p className="text-gray-500 text-sm">No past events found.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <div className="flex items-center mb-2">
            <h2 className="text-2xl font-semibold text-gray-800">Administrative Buckets</h2>
            <span className="ml-3 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">
              Not visible to members
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            These events are hidden from the main feed and used for granting hours manually.
          </p>
          
          <div className="max-h-[600px] overflow-y-auto pr-2">
            {loadingEvents ? (
              <LoadingSpinner text="Loading hidden events..." size="md" />
            ) : hiddenEvents.length > 0 ? (
              <EventListShort events={hiddenEvents} onEdit={onEditEvent} />
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No hidden administrative events found.</p>
                <button 
                  onClick={onCreateEvent}
                  className="mt-2 text-bapred hover:underline text-sm font-medium"
                >
                  Create your first bucket
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsSection;
