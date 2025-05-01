import { useNavigate } from "react-router-dom";
import { Event } from "../../types";

interface EventListShortProps {
  events: Event[];
  onEdit?: (event: Event) => void;
}

export const EventListShort: React.FC<EventListShortProps> = ({ events, onEdit }) => {
  const navigate = useNavigate();

  // Helper function to format date (optional, but good practice)
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Failed to format date:", error);
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col gap-3 py-1">
      {events.map((event) => (
        <div
          key={event.id}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 flex flex-col shadow-sm"
        >
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-base font-semibold text-gray-800">
              {event.event_name || "[No Title]"}
            </h3>
            <span className="text-xs text-gray-500">
              {event.event_date ? formatDate(event.event_date) : "[No Date]"}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {event.event_description ? (
              `Description: ${event.event_description}`
            ) : (
              <span className="text-gray-400 italic">
                [No Description Provided]
              </span>
            )}
          </p>
          <div className="ml-auto flex gap-2 mt-1">
            <button
              className="px-3 py-1 border border-bapred text-bapred text-xs rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-bapred"
              onClick={() =>
                navigate("/events", { state: { highlightEventId: event.id } })
              }
            >
              View
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="px-3 py-1 bg-bapred text-white text-xs rounded-md hover:bg-bapreddark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-bapred"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
