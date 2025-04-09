import { useNavigate } from "react-router-dom";
import { Event } from "../../types";

interface EventListShortProps {
    events: Event[];
}

export const EventListShort: React.FC<EventListShortProps> = ({ events }) => {
    const navigate = useNavigate();
    return (
        <div className="w-full h-full overflow-y-auto flex flex-col gap-2 py-2">
            {events.map((event) => (
                <div key={event.id} className="w-full border border-bapgray rounded-md px-4 py-2 flex flex-col">
                    <h3 className="text-lg font-semibold">{event.name}</h3>
                    <p className="text-sm">Description: {event.description}</p>
                    <div className="ml-auto flex gap-2 mt-2">
                        <button className="px-4 py-2 border border-bapred text-bapred text-sm rounded-md hover:bg-gray-100 transition-colors" onClick={() => navigate(`/events/${event.id}`)}>
                            View
                        </button>
                        <button className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors">
                            Edit
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
