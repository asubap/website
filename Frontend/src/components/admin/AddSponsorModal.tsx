import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../context/auth/supabaseClient";
import ConfirmationModal from "../common/ConfirmationModal";
import { useToast } from "../../context/toast/ToastContext";
import { useScrollLock } from "../../hooks/useScrollLock";

interface AddSponsorModalProps {
  onClose: () => void;
  onSponsorAdded: (newSponsor: {
    company_name: string;
    tier: "platinum" | "gold" | "silver" | "bronze";
    email_list: string[];
    passcode: string;
  }) => void;
}

// Define structure for errors state
interface FormErrors {
  sponsor?: string;
  tier?: "platinum" | "gold" | "silver" | "bronze";
  emailList?: string;
  passcode?: string;
}

const AddSponsorModal = ({ onClose, onSponsorAdded }: AddSponsorModalProps) => {
  useScrollLock(true);
  const { showToast } = useToast();
  const [sponsor, setSponsor] = useState("");
  const [tier, setTier] = useState<"platinum" | "gold" | "silver" | "bronze">(
    "bronze"
  );
  const [emailList, setEmailList] = useState<string[]>([]);
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);

  // Store initial state to check for changes
  const initialStateRef = useRef({
    sponsor,
    tier,
    emailList,
    passcode,
  });

  // Function to check if form data has changed
  const hasChanges = () => {
    const current = { sponsor, tier, emailList, passcode };
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

  const handleAddSponsor = async () => {
    const newErrors: FormErrors = {};

    // --- Validation ---
    if (!sponsor.trim()) newErrors.sponsor = "Sponsor is required";
    if (!tier) newErrors.tier = "platinum";
    if (!emailList.length) newErrors.emailList = "Email list is required";
    if (!passcode.trim()) newErrors.passcode = "Passcode is required";

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

      const sponsorData = {
        sponsor_name: sponsor.trim(),
        tier: tier,
        emailList: emailList,
        passcode: passcode,
      };

      // error if passcode is not at least 6 characters
      if (passcode.length < 6) {
        showToast("Passcode must be at least 6 characters long", "error");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/add-sponsor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sponsorData),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to add sponsor" }));
        console.error("Backend error:", errorData);
        showToast(
          `Error: ${errorData.message || "Failed to add sponsor"}`,
          "error"
        ); // Keep toast for server errors
        // Potentially set server-side validation errors here if backend provides field-specific errors
        // setErrors(mapBackendErrorsToFormErrors(errorData));
        throw new Error(errorData.message || "Failed to add sponsor");
      }

      const data = await response.json();

      onSponsorAdded(data);
      showToast("Sponsor added successfully", "success"); // Keep toast for success
      onClose(); // Close directly on success (no unsaved changes confirmation needed)
    } catch (error) {
      console.error("Error adding sponsor:", error);
      // Avoid showing generic toast if specific one was shown above
      if (!`${error}`.includes("Error: ")) {
        showToast("Failed to add sponsor. Please try again.", "error");
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
            Add New Sponsor
          </h2>

          {/* Sponsor */}
          <div className="mb-4">
            <label
              htmlFor="sponsor"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sponsor *
            </label>
            <input
              id="sponsor"
              type="text"
              placeholder="e.g., Deloitte"
              value={sponsor}
              onChange={(e) => {
                setSponsor(e.target.value);
                clearError("sponsor");
              }}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                errors.sponsor ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-invalid={!!errors.sponsor}
              aria-describedby={errors.sponsor ? "sponsor-error" : undefined}
            />
            {errors.sponsor && (
              <p id="sponsor-error" className="text-red-500 text-xs mt-1">
                {errors.sponsor}
              </p>
            )}
          </div>

          {/* Tier */}
          <div>
            <label
              htmlFor="tier"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tier *
            </label>
            <select
              id="tier"
              value={tier}
              onChange={(e) => {
                setTier(e.target.value as "platinum" | "gold" | "silver" | "bronze");
                clearError("tier");
              }}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred bg-white ${
                errors.tier ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-invalid={!!errors.tier}
              aria-describedby={
                errors.tier ? "tier-error" : undefined
              }
            >
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </select>
            {errors.tier && (
              <p id="tier-error" className="text-red-500 text-xs mt-1">
                {errors.tier}
              </p>
            )}
          </div>

          {/* Email List */}
          <div className="mb-4">
            <label
              htmlFor="emailList"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email List *
            </label>
            <textarea
              id="emailList"
              placeholder="Enter email addresses separated by commas..."
              value={emailList}
              onChange={(e) => {
                setEmailList(
                  e.target.value.split(",").map((email) => email.trim())
                );
                clearError("emailList");
              }}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                errors.emailList ? "border-red-500" : "border-gray-300"
              }`}
              rows={3}
              required
              aria-invalid={!!errors.emailList}
              aria-describedby={
                errors.emailList ? "emailList-error" : undefined
              }
            />
            {errors.emailList && (
              <p id="emailList-error" className="text-red-500 text-xs mt-1">
                {errors.emailList}
              </p>
            )}
          </div>

          {/* Passcode */}
          <div className="mb-4">
            <label
              htmlFor="passcode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Passcode *
            </label>
            <input
              id="passcode"
              type="text"
              placeholder="Enter passcode..."
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                clearError("passcode");
              }}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                errors.passcode ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-invalid={!!errors.passcode}
              aria-describedby={errors.passcode ? "passcode-error" : undefined}
            />
            {errors.passcode && (
              <p id="passcode-error" className="text-red-500 text-xs mt-1">
                {errors.passcode}
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
              onClick={handleAddSponsor}
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
                "Create Sponsor"
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

export default AddSponsorModal;
