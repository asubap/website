import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../context/auth/supabaseClient";
import { useToast } from "../../context/toast/ToastContext";
import ConfirmationModal from "../common/ConfirmationModal";
import { Announcement } from "../../types";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Editor } from '@tinymce/tinymce-react';


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

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);
  const [showConfirmCreateModal, setShowConfirmCreateModal] = useState(false);

  // Store initial state to check for changes
  const initialStateRef = useRef({
    title,
    description,
  });

  // Function to check if form data has changed
  const hasChanges = () => {
    const current = {
      title,
      description,
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

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // --- Validation ---
    if (!title) newErrors.title = "Title is required";
    if (!description) newErrors.description = "Description is required";

    // --- Update errors state and return if invalid ---
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleCreateClick = () => {
    if (validateForm()) {
      setShowConfirmCreateModal(true);
    }
  };

  const handleCreateAnnouncement = async () => {
    setShowConfirmCreateModal(false);
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
        title: title,
        description: description,
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
            <Editor
      apiKey={import.meta.env.VITE_TINY_MCE_KEY}
      init={{
        plugins: [
          // Core editing features
          'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
           ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Author name',
        mergetags_list: [
          { value: 'First.Name', title: 'First Name' },
          { value: 'Email', title: 'Email' },
        ],
       
        uploadcare_public_key: import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY,
      }}
      initialValue="Welcome to TinyMCE!"
      id="description"
      value={description}
      onEditorChange={(newValue, editor) => {
        setDescription(newValue);
        setDescription(editor.getContent());
      }}
    />
            {/* <textarea
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
            /> */}
            {errors.description && (
              <p id="description-error" className="text-red-500 text-xs mt-1">
                {errors.description}
              </p>
            )}
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
              onClick={handleCreateClick}
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

      {/* Confirmation Modal for Closing */}
      <ConfirmationModal
        isOpen={showConfirmCloseModal}
        onClose={() => setShowConfirmCloseModal(false)}
        onConfirm={handleConfirmClose}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to close this form?"
        confirmText="Discard"
        cancelText="Keep Editing"
      />

      {/* Confirmation Modal for Creating */}
      <ConfirmationModal
        isOpen={showConfirmCreateModal}
        onClose={() => setShowConfirmCreateModal(false)}
        onConfirm={handleCreateAnnouncement}
        title="Create Announcement?"
        message="Are you sure you want to create this announcement?"
        confirmText="Create"
        cancelText="Cancel"
      />
    </>,
    document.body
  );
};

export default CreateAnnouncementModal;
