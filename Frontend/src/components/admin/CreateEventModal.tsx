import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../context/auth/supabaseClient";
import { useToast } from "../../App";

interface CreateEventModalProps {
    onClose: () => void;
    onEventCreated: (newEvent: any) => void;
}

const CreateEventModal = ({ onClose, onEventCreated }: CreateEventModalProps) => {
    const { showToast } = useToast();
    const [eventTitle, setEventTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [sponsors, setSponsors] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [emailMembers, setEmailMembers] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Prevent body scrolling when modal is open
    useEffect(() => {
        // Save current overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;
        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';
        // Re-enable scrolling on unmount
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const handleCreateEvent = async () => {
        // Validate fields
        if (!eventTitle.trim()) {
            showToast("Please enter an event title", "error");
            return;
        }
        if (!description.trim()) {
            showToast("Please enter a description", "error");
            return;
        }
        if (!location.trim()) {
            showToast("Please enter a location", "error");
            return;
        }
        if (!date) {
            showToast("Please select a date", "error");
            return;
        }
        if (!time) {
            showToast("Please select a time", "error");
            return;
        }

        setIsLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                showToast("Authentication error. Please log in again.", "error");
                setIsLoading(false);
                return;
            }

            const token = session.access_token;
            const response = await fetch("https://asubap-backend.vercel.app/events/add-event", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_email: session.user.email,
                    name: eventTitle,
                    date: date,
                    location: location,
                    description: description,
                    time: time,
                    sponsors: sponsors,
                })
            });

            if (!response.ok) {
                throw new Error("Failed to create event");
            }

            const data = await response.json();
            
            // Call the callback with the new event data
            onEventCreated(data);
            
            // Show success message
            showToast("Event created successfully", "success");
            
            // Close the modal
            onClose();
        } catch (error) {
            console.error("Error creating event:", error);
            showToast("Failed to create event. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Create a portal to render the modal at the document body level
    return createPortal(
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg p-6 shadow-xl max-w-lg w-full m-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h2 className="text-xl font-semibold text-bapred mb-4">Create New Event</h2>
                
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Enter Event Title..."
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                    />
                </div>
                
                <div className="mb-4">
                    <textarea
                        placeholder="Enter description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                        rows={4}
                    />
                </div>
                
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Enter location..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                    />
                    <input
                        type="text"
                        placeholder="Add Sponsors Attending..."
                        value={sponsors}
                        onChange={(e) => setSponsors(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                    />
                </div>
                
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                    />
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                    />
                </div>
                
                <div className="mb-4 flex">
                    <div className="flex ml-auto">
                        <input
                            type="checkbox"
                            checked={emailMembers}
                            onChange={() => setEmailMembers(!emailMembers)}
                            className="mr-2"
                        />
                        <label>Email event to members?</label>
                    </div>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-bapred text-bapred text-sm rounded-md hover:bg-gray-100 transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateEvent}
                        className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors flex items-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : "Create Event"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateEventModal; 