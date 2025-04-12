import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../context/auth/supabaseClient";
import { useToast } from "../../App";
import ConfirmationModal from "../common/ConfirmationModal";

interface CreateEventModalProps {
    onClose: () => void;
    onEventCreated: (newEvent: any) => void;
}

// Define structure for errors state
interface FormErrors {
    eventTitle?: string;
    description?: string;
    location?: string;
    latitude?: string;
    longitude?: string;
    date?: string;
    time?: string;
    hours?: string;
    hoursType?: string;
    // No validation needed for sponsors or emailMembers currently
}

const CreateEventModal = ({ onClose, onEventCreated }: CreateEventModalProps) => {
    const { showToast } = useToast();
    const [eventTitle, setEventTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [sponsors, setSponsors] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [hours, setHours] = useState("");
    const [hoursType, setHoursType] = useState("professional");
    // const [emailMembers, setEmailMembers] = useState(false); // Keep if needed later, removed from UI
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);

    // Store initial state to check for changes
    const initialStateRef = useRef({
        eventTitle, description, location, latitude, longitude, sponsors, date, time, hours, hoursType
    });

    // Prevent body scrolling when modal is open
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        // Store initial state on mount
        initialStateRef.current = {
            eventTitle, description, location, latitude, longitude, sponsors, date, time, hours, hoursType
        };

        return () => {
            document.body.style.overflow = originalStyle;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only on mount

    // Function to check if form data has changed
    const hasChanges = () => {
        const current = { eventTitle, description, location, latitude, longitude, sponsors, date, time, hours, hoursType };
        return JSON.stringify(current) !== JSON.stringify(initialStateRef.current);
    };

    // Handle close attempts - now shows confirmation modal
    const handleCloseAttempt = () => {
        if (isLoading) return;
        if (hasChanges()) {
            setShowConfirmCloseModal(true);
        } else {
            onClose();
        }
    };

    // Actual close action, called by confirmation modal
    const handleConfirmClose = () => {
        setShowConfirmCloseModal(false);
        onClose();
    };

    // Helper to clear a specific error
    const clearError = (field: keyof FormErrors) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleCreateEvent = async () => {
        let newErrors: FormErrors = {};

        // --- Validation ---
        if (!eventTitle.trim()) newErrors.eventTitle = "Event title is required";
        if (!description.trim()) newErrors.description = "Description is required";
        if (!location.trim()) newErrors.location = "Location is required";
        if (!date) newErrors.date = "Date is required";
        if (!time) newErrors.time = "Time is required";
        if (!hours.trim()) newErrors.hours = "Event hours are required";
        if (!hoursType) newErrors.hoursType = "Hours type is required";

        const parsedLat = parseFloat(latitude);
        const parsedLong = parseFloat(longitude);
        const parsedHours = parseFloat(hours); // Use parseFloat for potential half-hours

        if (latitude.trim() && isNaN(parsedLat)) newErrors.latitude = "Must be a valid number";
        if (longitude.trim() && isNaN(parsedLong)) newErrors.longitude = "Must be a valid number";
        if (hours.trim() && (isNaN(parsedHours) || parsedHours <= 0)) newErrors.hours = "Must be a positive number";

        // --- Update errors state and return if invalid ---
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        // Clear errors if validation passes
        setErrors({});

        // Parse sponsors string into an array
        const sponsorsArray = sponsors.split(',').map(s => s.trim()).filter(s => s !== "");

        setIsLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                showToast("Authentication error. Please log in again.", "error"); // Keep toast for auth errors
                setIsLoading(false);
                return;
            }

            const token = session.access_token;
            
            const eventData = {
                event_name: eventTitle.trim(),
                event_description: description.trim(),
                event_location: location.trim(),
                event_lat: latitude.trim() ? parsedLat : null,
                event_long: longitude.trim() ? parsedLong : null,
                event_date: date,
                event_time: time,
                event_hours: parsedHours, // Send parsed number
                event_hours_type: hoursType,
                sponsors_attending: sponsorsArray,
            };

            const response = await fetch("https://asubap-backend.vercel.app/events/add-event", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ message: "Failed to create event" }));
                 console.error("Backend error:", errorData);
                 showToast(`Error: ${errorData.message || 'Failed to create event'}`, "error"); // Keep toast for server errors
                 // Potentially set server-side validation errors here if backend provides field-specific errors
                 // setErrors(mapBackendErrorsToFormErrors(errorData)); 
                 throw new Error(errorData.message || "Failed to create event");
            }

            const data = await response.json();
            
            onEventCreated(data);
            showToast("Event created successfully", "success"); // Keep toast for success
            onClose(); // Close directly on success (no unsaved changes confirmation needed)

        } catch (error) {
            console.error("Error creating event:", error);
            // Avoid showing generic toast if specific one was shown above
             if (!`${error}`.includes("Error: ")) {
                 showToast("Failed to create event. Please try again.", "error");
             }
        } finally {
            setIsLoading(false);
        }
    };

    // --- JSX ---
    return createPortal(
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto"
                onClick={handleCloseAttempt}
            >
                <div
                    className="bg-white rounded-lg p-6 pt-12 shadow-xl max-w-2xl w-full m-auto relative max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={handleCloseAttempt}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
                        aria-label="Close"
                        disabled={isLoading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <h2 className="text-xl font-semibold text-bapred mb-5 text-center">Create New Event</h2>

                    {/* Event Title */}
                    <div className="mb-4">
                         <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                        <input
                            id="eventTitle"
                            type="text"
                            placeholder="e.g., Spring Networking Night"
                            value={eventTitle}
                            onChange={(e) => { setEventTitle(e.target.value); clearError('eventTitle'); }}
                            className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.eventTitle ? 'border-red-500' : 'border-gray-300'}`}
                            required
                            aria-invalid={!!errors.eventTitle}
                            aria-describedby={errors.eventTitle ? "eventTitle-error" : undefined}
                        />
                        {errors.eventTitle && <p id="eventTitle-error" className="text-red-500 text-xs mt-1">{errors.eventTitle}</p>}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea
                            id="description"
                            placeholder="Detailed information about the event..."
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); clearError('description'); }}
                            className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                            rows={3}
                            required
                            aria-invalid={!!errors.description}
                            aria-describedby={errors.description ? "description-error" : undefined}
                        />
                        {errors.description && <p id="description-error" className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    {/* Location & Sponsors */}
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                             <input
                                 id="location"
                                 type="text"
                                 placeholder="e.g., Memorial Union, Room 202"
                                 value={location}
                                 onChange={(e) => { setLocation(e.target.value); clearError('location'); }}
                                 className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                                 required
                                 aria-invalid={!!errors.location}
                                 aria-describedby={errors.location ? "location-error" : undefined}
                             />
                             {errors.location && <p id="location-error" className="text-red-500 text-xs mt-1">{errors.location}</p>}
                         </div>
                         <div>
                            <label htmlFor="sponsors" className="block text-sm font-medium text-gray-700 mb-1">Sponsors Attending</label>
                            <input
                                id="sponsors"
                                type="text"
                                placeholder="e.g., Deloitte, KPMG (comma-separated)"
                                value={sponsors}
                                onChange={(e) => setSponsors(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred"
                            />
                             {/* No inline validation for sponsors currently */}
                         </div>
                    </div>

                     {/* Coordinates */}
                     <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                             <input
                                 id="latitude"
                                 type="number"
                                 step="any"
                                 placeholder="e.g., 33.4242"
                                 value={latitude}
                                 onChange={(e) => { setLatitude(e.target.value); clearError('latitude'); }}
                                 className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`}
                                 aria-invalid={!!errors.latitude}
                                 aria-describedby={errors.latitude ? "latitude-error" : undefined}
                             />
                              {errors.latitude && <p id="latitude-error" className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                         </div>
                         <div>
                             <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                             <input
                                 id="longitude"
                                 type="number"
                                 step="any"
                                 placeholder="e.g., -111.9281"
                                 value={longitude}
                                 onChange={(e) => { setLongitude(e.target.value); clearError('longitude'); }}
                                 className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.longitude ? 'border-red-500' : 'border-gray-300'}`}
                                 aria-invalid={!!errors.longitude}
                                  aria-describedby={errors.longitude ? "longitude-error" : undefined}
                             />
                             {errors.longitude && <p id="longitude-error" className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
                         </div>
                     </div>

                     {/* Date & Time */}
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => { setDate(e.target.value); clearError('date'); }}
                                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                                required
                                 aria-invalid={!!errors.date}
                                 aria-describedby={errors.date ? "date-error" : undefined}
                            />
                             {errors.date && <p id="date-error" className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                         <div>
                             <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                             <input
                                 id="time"
                                 type="time"
                                 value={time}
                                 onChange={(e) => { setTime(e.target.value); clearError('time'); }}
                                 className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.time ? 'border-red-500' : 'border-gray-300'}`}
                                 required
                                 aria-invalid={!!errors.time}
                                 aria-describedby={errors.time ? "time-error" : undefined}
                             />
                             {errors.time && <p id="time-error" className="text-red-500 text-xs mt-1">{errors.time}</p>}
                         </div>
                    </div>

                    {/* Hours & Type */}
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">Event Hours *</label>
                            <input
                                id="hours"
                                type="number"
                                min="0.5"
                                step="0.5"
                                placeholder="e.g., 2"
                                value={hours}
                                onChange={(e) => { setHours(e.target.value); clearError('hours'); }}
                                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.hours ? 'border-red-500' : 'border-gray-300'}`}
                                required
                                aria-invalid={!!errors.hours}
                                aria-describedby={errors.hours ? "hours-error" : undefined}
                             />
                             {errors.hours && <p id="hours-error" className="text-red-500 text-xs mt-1">{errors.hours}</p>}
                         </div>
                         <div>
                             <label htmlFor="hoursType" className="block text-sm font-medium text-gray-700 mb-1">Hours Type *</label>
                             <select
                                 id="hoursType"
                                 value={hoursType}
                                 onChange={(e) => { setHoursType(e.target.value); clearError('hoursType'); }}
                                 className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred bg-white ${errors.hoursType ? 'border-red-500' : 'border-gray-300'}`}
                                 required
                                 aria-invalid={!!errors.hoursType}
                                 aria-describedby={errors.hoursType ? "hoursType-error" : undefined}
                             >
                                 <option value="professional">Professional</option>
                                 <option value="social">Social</option>
                                 {/* Add other valid types from backend if needed */}
                             </select>
                             {errors.hoursType && <p id="hoursType-error" className="text-red-500 text-xs mt-1">{errors.hoursType}</p>}
                         </div>
                     </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={handleCloseAttempt}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-100 transition-colors"
                            disabled={isLoading}
                            type="button"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateEvent}
                            className={`px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                            type="button"
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
            </div>

            {/* Confirmation Modal Integration */}
            <ConfirmationModal
                isOpen={showConfirmCloseModal}
                onClose={() => setShowConfirmCloseModal(false)}
                onConfirm={handleConfirmClose}
                title="Discard Changes?"
                message="You have unsaved changes. Are you sure you want to close this form?"
                confirmText="Discard"
                cancelText="Keep Editing"
            />
        </>,
        document.body
    );
};

export default CreateEventModal; 