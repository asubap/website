import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../context/auth/supabaseClient";
import ConfirmationModal from "../common/ConfirmationModal";
import { useToast } from "../../context/toast/ToastContext";
import { useScrollLock } from "../../hooks/useScrollLock";

interface AddUserModalProps {
  role: "general-member" | "e-board";
  title: string;
  label: string;
  buttonText: string;
  onClose: () => void;
  onUserAdded: (newUsers: string[]) => void;
}

interface FormErrors {
  emails?: string;
}

const AddUserModal = ({ role, title, label, buttonText, onClose, onUserAdded }: AddUserModalProps) => {
  useScrollLock(true);
  const { showToast } = useToast();
  const [emailsInput, setEmailsInput] = useState("");
  const [pendingEmails, setPendingEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);
  const initialStateRef = useRef({ emailsInput });

  const hasChanges = () => emailsInput !== initialStateRef.current.emailsInput || pendingEmails.length > 0;

  const handleCloseAttempt = () => {
    if (isLoading) return;
    if (hasChanges()) {
      setShowConfirmCloseModal(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmCloseModal(false);
    onClose();
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If the last character is space or comma, add to pending list
    if (/[,\s]$/.test(value)) {
      const email = value.slice(0, -1).trim();
      if (email) {
        if (!validateEmail(email)) {
          setErrors({ emails: `Invalid email format: ${email}` });
        } else if (pendingEmails.includes(email)) {
          setErrors({ emails: `Email already added: ${email}` });
        } else {
          setPendingEmails((prev) => [...prev, email]);
          setErrors({});
        }
      }
      setEmailsInput("");
    } else {
      setEmailsInput(value);
      setErrors({});
    }
  };

  const handleRemoveEmail = (email: string) => {
    setPendingEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleAddUsers = async () => {
    if (emailsInput.trim()) {
      // Add any remaining input to the pending list
      if (!validateEmail(emailsInput.trim())) {
        setErrors({ emails: `Invalid email format: ${emailsInput.trim()}` });
        return;
      } else if (pendingEmails.includes(emailsInput.trim())) {
        setErrors({ emails: `Email already added: ${emailsInput.trim()}` });
        return;
      } else {
        setPendingEmails((prev) => [...prev, emailsInput.trim()]);
        setEmailsInput("");
      }
    }
    if (pendingEmails.length === 0 && !emailsInput.trim()) {
      setErrors({ emails: "Please enter at least one email address." });
      return;
    }
    setErrors({});
    setIsLoading(true);
    const emailsToAdd = [...pendingEmails];
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast("Authentication error. Please log in again.", "error");
        setIsLoading(false);
        return;
      }
      const token = session.access_token;
      const addUserPromises = emailsToAdd.map((email) =>
        fetch(`${import.meta.env.VITE_BACKEND_URL}/users/add-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_email: email, role }),
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { email, success: false, error: errorData.message || `Failed to add ${email}` };
          }
          return { email, success: true };
        }).catch(error => {
          return { email, success: false, error: error.message || `Network error for ${email}` };
        })
      );
      const results = await Promise.allSettled(addUserPromises);
      const successfulEmails: string[] = [];
      const failedEmails: string[] = [];
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.success) {
          successfulEmails.push(result.value.email);
        } else if (result.status === "fulfilled" && !result.value.success) {
          failedEmails.push(`${result.value.email} (${result.value.error})`);
        } else if (result.status === "rejected") {
          const reason = result.reason as any;
          failedEmails.push(`Unknown email (Error: ${reason?.message || 'Unknown error'})`);
        }
      });
      if (successfulEmails.length > 0) {
        onUserAdded(successfulEmails);
        showToast(`${successfulEmails.length} user(s) added successfully.`, "success");
        setEmailsInput("");
        setPendingEmails([]);
        onClose();
      }
      if (failedEmails.length > 0) {
        showToast(
          `Failed to add: ${failedEmails.join("; ")}`,
          "error",
          failedEmails.length > 1 ? 10000 : 5000
        );
      }
    } catch (error) {
      showToast("Failed to add user(s). Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto"
        onClick={handleCloseAttempt}
      >
        <div
          className="bg-white rounded-lg p-6 pt-12 shadow-xl max-w-md w-full m-auto relative max-h-[90vh] overflow-y-auto"
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
            {title}
          </h2>

          <div className="mb-4">
            <label
              htmlFor="emails"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label} <span className="text-red-500">*</span>
            </label>
            <input
              id="emails"
              type="text"
              placeholder="Type email and press space or comma..."
              value={emailsInput}
              onChange={handleInputChange}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-bapred ${
                errors.emails ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-invalid={!!errors.emails}
              aria-describedby={errors.emails ? "emails-error" : undefined}
              disabled={isLoading}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUsers();
                }
              }}
            />
            {errors.emails && (
              <p id="emails-error" className="text-red-500 text-xs mt-1">
                {errors.emails}
              </p>
            )}
            {/* Pending emails list */}
            {pendingEmails.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {pendingEmails.map(email => (
                  <div
                    key={email}
                    className="w-full border border-bapred rounded-md px-4 py-2 flex justify-between items-center bg-white"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      className="text-bapred hover:text-bapreddark font-bold text-lg ml-2 focus:outline-none"
                      onClick={() => handleRemoveEmail(email)}
                      disabled={isLoading}
                      aria-label={`Remove ${email}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleAddUsers}
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
                  Adding...
                </>
              ) : (
                <>{buttonText}</>
              )}
            </button>
          </div>
        </div>
      </div>
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

export default AddUserModal; 