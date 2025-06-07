import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../context/auth/supabaseClient";
import { useToast } from "../../context/toast/ToastContext";
import ConfirmationModal from "../common/ConfirmationModal";
import { Event } from "../../types";
import LocationPicker, { LocationObject } from '../common/LocationPicker';
import SponsorMultiSelect from '../common/SponsorMultiSelect';
import { useScrollLock } from "../../hooks/useScrollLock";

interface CreateEventModalProps {
  onClose: () => void;
  onEventCreated: (newEvent: Event) => void;
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
  checkInWindow?: string;
  // No validation needed for sponsors or emailMembers currently
}

const CreateEventModal = ({
  onClose,
  onEventCreated,
}: CreateEventModalProps) => {
  useScrollLock(true);
  const { showToast } = useToast();
  const [eventTitle, setEventTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<LocationObject>({ name: "", latitude: 33.4242, longitude: -111.9281 });
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hours, setHours] = useState("");
  const [hoursType, setHoursType] = useState("professional");
  const [checkInWindow, setCheckInWindow] = useState(15);
  // const [emailMembers, setEmailMembers] = useState(false); // Keep if needed later, removed from UI
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);

  // Store initial state to check for changes
  const initialStateRef = useRef({
    eventTitle,
    description,
    location,
    sponsors,
    date,
    time,
    hours,
    hoursType,
    checkInWindow,
  });

  // Function to check if form data has changed
  const hasChanges = () => {
    const current = {
      eventTitle,
      description,
      location,
      sponsors,
      date,
      time,
      hours,
      hoursType,
      checkInWindow,
    };
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
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateEvent = async () => {
    const newErrors: FormErrors = {};

    // --- Validation ---
    if (!eventTitle.trim()) newErrors.eventTitle = "Event title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!location.name.trim()) newErrors.location = "Location name is required";
    if (!date) newErrors.date = "Date is required";
    if (!time) newErrors.time = "Time is required";
    if (!hours.trim()) newErrors.hours = "Event hours are required";
    if (!hoursType) newErrors.hoursType = "Hours type is required";
    if (!checkInWindow) newErrors.checkInWindow = "Check-in window is required";
    
    const parsedHours = parseFloat(hours);

    if (hours.trim() && (isNaN(parsedHours) || parsedHours <= 0))
      newErrors.hours = "Must be a positive number";

    if (isNaN(checkInWindow) || checkInWindow <= 0)
      newErrors.checkInWindow = "Must be a positive number";

    // --- Update errors state and return if invalid ---
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        showToast("Authentication error. Please log in again.", "error"); // Keep toast for auth errors
        setIsLoading(false);
        return;
      }

      const token = session.access_token;

      const eventData = {
        event_name: eventTitle.trim(),
        event_description: description.trim(),
        event_location: location.name.trim() || "Unnamed Location",
        event_lat: location.latitude,
        event_long: location.longitude,
        event_date: date,
        event_time: time,
        event_hours: parsedHours, // Send parsed number
        event_hours_type: hoursType,
        sponsors_attending: sponsors,
        check_in_window: checkInWindow,
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/events/add-event`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to create event" }));
        console.error("Backend error:", errorData);
        showToast(
          `Error: ${errorData.message || "Failed to create event"}`,
          "error"
        ); // Keep toast for server errors
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-xl font-semibold text-bapred mb-5 text-center">
            Create New Event
          </h2>

          {/* Event Title */}
          <div className="mb-4">
            <label
              htmlFor="eventTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Title *
            </label>
            <input
              id="eventTitle"
              type="text"
              placeholder="e.g., Spring Networking Night"
              value={eventTitle}
              onChange={(e) => {
                setEventTitle(e.target.value);
                clearError("eventTitle");
              }}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                errors.eventTitle ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-invalid={!!errors.eventTitle}
              aria-describedby={
                errors.eventTitle ? "eventTitle-error" : undefined
              }
            />
            {errors.eventTitle && (
              <p id="eventTitle-error" className="text-red-500 text-xs mt-1">
                {errors.eventTitle}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description *
            </label>
            <textarea
              id="description"
              placeholder="Detailed information about the event..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearError("description");
              }}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              rows={3}
              required
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
            />
            {errors.description && (
              <p id="description-error" className="text-red-500 text-xs mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Location & Sponsors */}
          <div>
              <SponsorMultiSelect value={sponsors} onChange={setSponsors} />
          </div>


          {/* Location Picker */}
          <LocationPicker
            location={location}
            onChange={setLocation}
            error={errors.location}
          />

          {/* Date & Time */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date *
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  clearError("date");
                }}
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                  errors.date ? "border-red-500" : "border-gray-300"
                }`}
                required
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "date-error" : undefined}
              />
              {errors.date && (
                <p id="date-error" className="text-red-500 text-xs mt-1">
                  {errors.date}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Time *
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  clearError("time");
                }}
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                  errors.time ? "border-red-500" : "border-gray-300"
                }`}
                required
                aria-invalid={!!errors.time}
                aria-describedby={errors.time ? "time-error" : undefined}
              />
              {errors.time && (
                <p id="time-error" className="text-red-500 text-xs mt-1">
                  {errors.time}
                </p>
              )}
            </div>
          </div>

          {/* Hours & Type */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="hours"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Event Hours *
              </label>
              <input
                id="hours"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="e.g., 2"
                value={hours}
                onChange={(e) => {
                  setHours(e.target.value);
                  clearError("hours");
                }}
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                  errors.hours ? "border-red-500" : "border-gray-300"
                }`}
                required
                aria-invalid={!!errors.hours}
                aria-describedby={errors.hours ? "hours-error" : undefined}
              />
              {errors.hours && (
                <p id="hours-error" className="text-red-500 text-xs mt-1">
                  {errors.hours}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="hoursType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Hours Type *
              </label>
              <select
                id="hoursType"
                value={hoursType}
                onChange={(e) => {
                  setHoursType(e.target.value);
                  clearError("hoursType");
                }}
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred bg-white ${
                  errors.hoursType ? "border-red-500" : "border-gray-300"
                }`}
                required
                aria-invalid={!!errors.hoursType}
                aria-describedby={
                  errors.hoursType ? "hoursType-error" : undefined
                }
              >
                <option value="professional">Professional</option>
                <option value="social">Social</option>
                <option value="service">Service</option>
                <option value="development">Development</option>
                {/* Add other valid types from backend if needed */}
              </select>
              {errors.hoursType && (
                <p id="hoursType-error" className="text-red-500 text-xs mt-1">
                  {errors.hoursType}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="checkInWindow"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Check-in Window (minutes) *
              </label>
              <input
                id="checkInWindow"
                type="number"
                min="1"
                step="1"
                placeholder="e.g., 15"
                value={checkInWindow}
                onChange={(e) => {
                  setCheckInWindow(Number(e.target.value));
                  clearError("checkInWindow");
                }}
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                  errors.checkInWindow ? "border-red-500" : "border-gray-300"
                }`}
                required
                aria-invalid={!!errors.checkInWindow}
                aria-describedby={errors.checkInWindow ? "checkInWindow-error" : undefined}
              />
              {errors.checkInWindow && (
                <p id="checkInWindow-error" className="text-red-500 text-xs mt-1">
                  {errors.checkInWindow}
                </p>
              )}
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
              className={`px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors flex items-center justify-center ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
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
