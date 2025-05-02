import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../context/auth/supabaseClient";
import { useToast } from "../../context/toast/ToastContext";
import ConfirmationModal from "../common/ConfirmationModal";
import { Announcement } from "../../types";
import { useScrollLock } from "../../hooks/useScrollLock";

interface EditAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcementToEdit: Announcement;
  onAnnouncementUpdated: (updatedAnnouncement: Announcement) => void;
}

// Define structure for errors state
interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
}

interface FormDataState {
  title: string;
  description: string;

}

const EditAnnouncementModal = ({
  isOpen,
  onClose,
  announcementToEdit,
  onAnnouncementUpdated,
}: EditAnnouncementModalProps) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    description: "",
   
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);

  const localStorageKey = `modal-announcement-edit-${announcementToEdit?.id}`;
  const initialStateRef = useRef<FormDataState | null>(null);
  const hasInitialized = useRef(false);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!announcementToEdit || !announcementToEdit.id) return; // Guard: only run if valid announcement

    const initialState: FormDataState = {
      title: announcementToEdit.title || "",
      description: announcementToEdit.description || "",

    };
    initialStateRef.current = initialState;

    // Always clear localStorage if a new announcement is being edited
    localStorage.removeItem(localStorageKey);

    setFormData(initialState);
    setErrors({});
    hasInitialized.current = true;
  }, [announcementToEdit, localStorageKey]);

  // Save current state to localStorage whenever formData changes *IF* it differs from initial
  useEffect(() => {
    if (!initialStateRef.current || !hasInitialized.current) return;
    if (JSON.stringify(formData) !== JSON.stringify(initialStateRef.current)) {
      localStorage.setItem(localStorageKey, JSON.stringify(formData));
    }
  }, [formData, localStorageKey]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ 
        ...prev, 
        isPinned: (e.target as HTMLInputElement).checked 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name as keyof FormErrors]) {
        clearError(name as keyof FormErrors);
      }
    }
  };

  // Function to check if form data has changed from initial loaded state
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialStateRef.current);
  };

  const handleCloseAttempt = () => {
    if (isLoading) return;
    if (hasChanges()) {
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

  const handleSaveAnnouncement = async () => {
    const newErrors: FormErrors = {};

    // --- Validation ---
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
 

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

      // Prepare data for EDIT endpoint with only required fields
      const announcementDataToUpdate = {
        announcement_id: announcementToEdit.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/announcements/edit-announcement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(announcementDataToUpdate),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to update announcement" }));
        console.error("Backend error:", errorData);
        showToast(`Error: ${errorData.message || "Failed to update announcement"}`, "error");
        throw new Error(errorData.message || "Failed to update announcement");
      }

      // Construct the updated announcement object for immediate UI update
      const updatedAnnouncement: Announcement = {
        ...announcementToEdit,
        title: formData.title.trim(),
        description: formData.description.trim(),
    
      };

      onAnnouncementUpdated(updatedAnnouncement);
      showToast("Announcement updated successfully", "success");
      localStorage.removeItem(localStorageKey); // Clear storage on successful save
      onClose();
    } catch (error) {
      console.error("Error updating announcement:", error);
      if (!`${error}`.includes("Error: ")) {
        showToast("Failed to update announcement. Please try again.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !announcementToEdit) return null;

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
            Edit Announcement
          </h2>

          {/* Form fields */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input 
              id="title" 
              name="title" 
              type="text" 
              placeholder="Announcement title" 
              value={formData.title} 
              onChange={handleInputChange} 
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.title ? 'border-red-500' : 'border-gray-300'}`} 
              required 
              aria-invalid={!!errors.title} 
              aria-describedby={errors.title ? 'title-error' : undefined} 
            />
            {errors.title && <p id="title-error" className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea 
              id="description" 
              name="description" 
              placeholder="Announcement details..." 
              value={formData.description} 
              onChange={handleInputChange} 
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${errors.description ? 'border-red-500' : 'border-gray-300'}`} 
              rows={3} 
              required 
              aria-invalid={!!errors.description} 
              aria-describedby={errors.description ? 'description-error' : undefined} 
            />
            {errors.description && <p id="description-error" className="text-red-500 text-xs mt-1">{errors.description}</p>}
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
              onClick={handleSaveAnnouncement}
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

export default EditAnnouncementModal;
