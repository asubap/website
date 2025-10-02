import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../context/auth/supabaseClient";
import { useToast } from "../../context/toast/ToastContext";
import ConfirmationModal from "../common/ConfirmationModal";
import { Event } from "../../types";
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import LocationPicker, { LocationObject } from '../common/LocationPicker';
import SponsorMultiSelect from '../common/SponsorMultiSelect';
import { useScrollLock } from "../../hooks/useScrollLock";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit: Event;
  onEventUpdated: (updatedEvent: Event) => void;
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
  checkInRadius?: string;
  eventLimit?: string;
}

interface FormDataState {
  eventTitle: string;
  description: string;
  location: LocationObject;
  sponsors: string[];
  date: string;
  time: string;
  hours: string;
  hoursType: string;
  checkInWindow: number;
  checkInRadius: number;
  eventLimit: string;
}

const EditEventModal = ({
  isOpen,
  onClose,
  eventToEdit,
  onEventUpdated,
}: EditEventModalProps) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormDataState>({
    eventTitle: "",
    description: "",
    location: { name: "", latitude: 33.4242, longitude: -111.9281 }, // Default to ASU coords
    sponsors: [],
    date: "",
    time: "",
    hours: "",
    hoursType: "professional", // Default value
    checkInWindow: 15,
    checkInRadius: 50,
    eventLimit: "100",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);

  const localStorageKey = `modal-event-edit-${eventToEdit?.id}`;
  const initialStateRef = useRef<FormDataState | null>(null);
  const hasInitialized = useRef(false);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!eventToEdit || !eventToEdit.id) return; // Guard: only run if valid event

    const localStorageKey = `modal-event-edit-${eventToEdit.id}`;
    const initialState: FormDataState = {
      eventTitle: eventToEdit.event_name || "",
      description: eventToEdit.event_description || "",
      location: {
        name: eventToEdit.event_location || "",
        latitude: eventToEdit.event_lat ?? 33.4242,
        longitude: eventToEdit.event_long ?? -111.9281,
      },
      sponsors: eventToEdit.sponsors_attending || [],
      date: eventToEdit.event_date ? eventToEdit.event_date.split("T")[0] : "",
      time: eventToEdit.event_time || "",
      hours: eventToEdit.event_hours?.toString() || "",
      hoursType: eventToEdit.event_hours_type || "professional",
      checkInWindow: eventToEdit.check_in_window || 15,
      checkInRadius: eventToEdit.check_in_radius || 50,
      eventLimit: eventToEdit.event_limit?.toString() || "100",
    };
    initialStateRef.current = initialState;

    // Always clear localStorage if a new event is being edited
    localStorage.removeItem(localStorageKey);

    setFormData(initialState);
    setErrors({});
    hasInitialized.current = true;
  }, [eventToEdit]);

  // Save current state to localStorage whenever formData changes *IF* it differs from initial
  useEffect(() => {
    if (!initialStateRef.current || !hasInitialized.current) return;
    if (JSON.stringify(formData) !== JSON.stringify(initialStateRef.current)) {
      localStorage.setItem(`modal-event-edit-${eventToEdit?.id}`, JSON.stringify(formData));    }
  }, [formData, eventToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "locationName") {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          name: value,
        },
      }));
      if (errors.location) clearError("location");
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
        clearError(name as keyof FormErrors);
    }
  };

  // Function to check if form data has changed from initial loaded state
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialStateRef.current);
  };

  const handleCloseAttempt = () => {
    if (isLoading) return;
    if (hasChanges()) { // Use hasChanges which compares against initialStateRef
      setShowConfirmCloseModal(true);
    } else {
      localStorage.removeItem(localStorageKey);
      onClose();
    }
  };

  // Actual close action, called by confirmation modal (Discard Changes)
  const handleConfirmClose = () => {
    setShowConfirmCloseModal(false);
    localStorage.removeItem(localStorageKey); // Clear storage on discard
    onClose();
  };

  // Helper to clear a specific error
  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSaveEvent = async () => {
    const newErrors: FormErrors = {};

    // --- Validation (same as create) ---
    if (!formData.eventTitle.trim()) newErrors.eventTitle = "Event title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location.name.trim()) newErrors.location = "Location name is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.hours.trim()) newErrors.hours = "Event hours are required";
    if (!formData.hoursType) newErrors.hoursType = "Hours type is required";
    if (!formData.checkInWindow) newErrors.checkInWindow = "Check-in window is required";
    if (!formData.checkInRadius) newErrors.checkInRadius = "Check-in radius is required";
    if (!formData.eventLimit) newErrors.eventLimit = "Event limit is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast("Authentication error. Please log in again.", "error");
        setIsLoading(false);
        return;
      }
      const token = session.access_token;

      // --- Prepare data for EDIT endpoint ---
      const eventDataToUpdate: { [key: string]: any } = {
        event_id: eventToEdit.id,
        name: formData.eventTitle.trim(),
        date: formData.date || "",
        location: {
          name: formData.location.name.trim() || "Unnamed Location",
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
        },
        description: formData.description.trim(),
        time: formData.time || "",
        sponsors: formData.sponsors,
        check_in_window: formData.checkInWindow,
        check_in_radius: formData.checkInRadius,
        event_limit: formData.eventLimit ? parseInt(formData.eventLimit) : 100,
      };
      if (formData.hours.trim()) eventDataToUpdate.event_hours = parseFloat(formData.hours);
      if (formData.hoursType) eventDataToUpdate.event_hours_type = formData.hoursType;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/events/edit-event`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(eventDataToUpdate),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to update event" }));
        console.error("Backend error:", errorData);
        showToast(`Error: ${errorData.message || "Failed to update event"}`, "error");
        throw new Error(errorData.message || "Failed to update event");
      }

      // Assuming backend returns the updated event object or confirms success
      // Construct the updated event object locally for immediate UI update
      const updatedEvent: Event = {
        ...eventToEdit,
        event_name: formData.eventTitle.trim(),
        event_description: formData.description.trim(),
        event_location: formData.location.name.trim(),
        event_lat: formData.location.latitude,
        event_long: formData.location.longitude,
        event_date: formData.date,
        event_time: formData.time,
        event_hours: parseFloat(formData.hours),
        event_hours_type: formData.hoursType,
        sponsors_attending: formData.sponsors,
        id: eventToEdit.id,
        event_attending: eventToEdit.event_attending ?? [],
        event_rsvped: eventToEdit.event_rsvped ?? [],
        check_in_window: formData.checkInWindow,
        check_in_radius: formData.checkInRadius,
        event_limit: formData.eventLimit ? parseInt(formData.eventLimit) : 100,
      };

      onEventUpdated(updatedEvent);
      showToast("Event updated successfully", "success");
      localStorage.removeItem(localStorageKey); // Clear storage on successful save
      onClose();
    } catch (error) {
      console.error("Error updating event:", error);
      if (!`${error}`.includes("Error: ")) {
        showToast("Failed to update event. Please try again.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };



  if (!isOpen || !eventToEdit) return null;

  // --- JSX --- (Mostly same as CreateEventModal, but with different title and save handler)
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
            Edit Event
          </h2>

          {/* Form fields (same as CreateEventModal) */}
          {/* ... Event Title ... */}
          <div className="mb-4">
            <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input id="eventTitle" name="eventTitle" type="text" placeholder="e.g., Spring Networking Night" value={formData.eventTitle} onChange={handleInputChange} className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.eventTitle ? 'border-red-500' : 'border-gray-300'}`} required aria-invalid={!!errors.eventTitle} aria-describedby={errors.eventTitle ? 'eventTitle-error' : undefined} />
            {errors.eventTitle && <p id="eventTitle-error" className="text-red-500 text-xs mt-1">{errors.eventTitle}</p>}
          </div>

          {/* ... Description ... */}
           <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea id="description" name="description" placeholder="Detailed information about the event..." value={formData.description} onChange={handleInputChange} className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.description ? 'border-red-500' : 'border-gray-300'}`} rows={3} required aria-invalid={!!errors.description} aria-describedby={errors.description ? 'description-error' : undefined} />
            {errors.description && <p id="description-error" className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* ... Sponsors Dropdown ... */}
            <div>
              <SponsorMultiSelect value={formData.sponsors} onChange={s => setFormData(prev => ({ ...prev, sponsors: s }))} />
            </div>

          {/* ... Location ... */}
          <LocationPicker
            location={formData.location}
            onChange={loc => setFormData(prev => ({ ...prev, location: loc }))}
            error={errors.location}
          />

          {/* ... Date & Time ... */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input id="date" name="date" type="date" placeholder="mm/dd/yyyy" value={formData.date} onChange={handleInputChange} className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.date ? 'border-red-500' : 'border-gray-300'}`} required aria-invalid={!!errors.date} aria-describedby={errors.date ? 'date-error' : undefined} />
              {errors.date && <p id="date-error" className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input id="time" name="time" type="time" placeholder="--:-- --" value={formData.time} onChange={handleInputChange} className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.time ? 'border-red-500' : 'border-gray-300'}`} required aria-invalid={!!errors.time} aria-describedby={errors.time ? 'time-error' : undefined} />
              {errors.time && <p id="time-error" className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* ... Hours & Type ... */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">Event Hours *</label>
              <input id="hours" name="hours" type="number" min="0.5" step="0.5" placeholder="e.g., 2" value={formData.hours} onChange={handleInputChange} className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.hours ? 'border-red-500' : 'border-gray-300'}`} required aria-invalid={!!errors.hours} aria-describedby={errors.hours ? 'hours-error' : undefined} />
              {errors.hours && <p id="hours-error" className="text-red-500 text-xs mt-1">{errors.hours}</p>}
            </div>
            <div>
              <label htmlFor="hoursType" className="block text-sm font-medium text-gray-700 mb-1">Hours Type *</label>
              <select id="hoursType" name="hoursType" value={formData.hoursType} onChange={handleInputChange} className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred bg-white ${errors.hoursType ? 'border-red-500' : 'border-gray-300'}`} required aria-invalid={!!errors.hoursType} aria-describedby={errors.hoursType ? 'hoursType-error' : undefined} >
                <option value="professional">Professional</option>
                <option value="social">Social</option>
                <option value="service">Service</option>
                <option value="development">Development</option>
              </select>
              {errors.hoursType && <p id="hoursType-error" className="text-red-500 text-xs mt-1">{errors.hoursType}</p>}
            </div>
            <div>
              <label htmlFor="checkInWindow" className="block text-sm font-medium text-gray-700 mb-1">Check-in Window (minutes) *</label>
              <input
                id="checkInWindow"
                name="checkInWindow"
                type="number"
                min="1"
                step="1"
                placeholder="e.g., 15"
                value={formData.checkInWindow}
                onChange={handleInputChange}
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
            <div>
              <label htmlFor="checkInRadius" className="block text-sm font-medium text-gray-700 mb-1">Check-in Radius (meters) *</label>
              <input
                id="checkInRadius"
                name="checkInRadius"
                type="number"
                min="1"
                step="1"
                placeholder="e.g., 15"
                value={formData.checkInRadius}
                onChange={handleInputChange}
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                  errors.checkInRadius ? "border-red-500" : "border-gray-300"
                }`}
                required
                aria-invalid={!!errors.checkInRadius}
                aria-describedby={errors.checkInRadius ? "checkInRadius-error" : undefined}
              />
              {errors.checkInRadius && (
                <p id="checkInRadius-error" className="text-red-500 text-xs mt-1">
                  {errors.checkInRadius}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="eventLimit" className="block text-sm font-medium text-gray-700 mb-1">Event Limit *</label>
              <input
                id="eventLimit"
                name="eventLimit"
                type="number"
                min="1"
                step="1"
                placeholder="e.g., 15"
                value={formData.eventLimit}
                onChange={handleInputChange}
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                  errors.eventLimit ? "border-red-500" : "border-gray-300"
                }`}
                required
                aria-invalid={!!errors.eventLimit}
                aria-describedby={errors.eventLimit ? "eventLimit-error" : undefined}
              />
              {errors.eventLimit && (
                <p id="eventLimit-error" className="text-red-500 text-xs mt-1">
                  {errors.eventLimit}
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
              onClick={handleSaveEvent} // Changed handler
              className={`px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors flex items-center justify-center ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                 <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Integration */}
      <ConfirmationModal
        isOpen={showConfirmCloseModal}
        onClose={() => setShowConfirmCloseModal(false)}
        onConfirm={handleConfirmClose} // Use discard handler
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to close this form?"
        confirmText="Discard"
        cancelText="Keep Editing"
      />
    </>,
    document.body
  );
};

export default EditEventModal; 