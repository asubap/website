import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../context/auth/supabaseClient";
import { useToast } from "../../context/toast/ToastContext";
import ConfirmationModal from "../common/ConfirmationModal";
import { Announcement } from "../../types";
import { useScrollLock } from "../../hooks/useScrollLock";

interface CreateAnnouncementModalProps {
  onClose: () => void;
  onAnnouncementCreated: (newAnnouncement: Announcement) => void;
}

// Define structure for errors state
interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
}

const CreateAnnouncementModal = ({
  onClose,
  onAnnouncementCreated,
}: CreateAnnouncementModalProps) => {
  useScrollLock(true);
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);

  // Store initial state to check for changes
  const initialStateRef = useRef({
    title,
    description,
    date,
    isPinned,
  });

  // Function to check if form data has changed
  const hasChanges = () => {
    const current = {
      title,
      description,
      date,
      isPinned,
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

  const handleCreateAnnouncement = async () => {
    const newErrors: FormErrors = {};

    // --- Validation ---
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!date) newErrors.date = "Date is required";

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
        showToast("Authentication error. Please log in again.", "error");
        setIsLoading(false);
        return;
      }

      const token = session.access_token;

      const announcementData = {
        title: title.trim(),
        description: description.trim(),
        date: date,
        is_pinned: isPinned,
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/announcements/add-announcement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(announcementData),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to create announcement" }));
        console.error("Backend error:", errorData);
        showToast(
          `Error: ${errorData.message || "Failed to create announcement"}`,
          "error"
        );
        throw new Error(errorData.message || "Failed to create announcement");
      }

      const data = await response.json();

      onAnnouncementCreated(data);
      showToast("Announcement created successfully", "success");
      onClose();
    } catch (error) {
      console.error("Error creating announcement:", error);
      if (!`${error}`.includes("Error: ")) {
        showToast("Failed to create announcement. Please try again.", "error");
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
            Create New Announcement
          </h2>

          {/* Announcement Title */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., New Membership Drive"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearError("title");
              }}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-red-500 text-xs mt-1">
                {errors.title}
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
              placeholder="Announcement details..."
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

          {/* Date */}
          <div className="mb-4">
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

          {/* Pin Announcement Checkbox */}
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-gray-300 text-bapred focus:ring-bapred"
              />
              <span className="ml-2 text-sm text-gray-700">
                Pin this announcement
              </span>
            </label>
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
              onClick={handleCreateAnnouncement}
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
                "Create Announcement"
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

export default CreateAnnouncementModal;
