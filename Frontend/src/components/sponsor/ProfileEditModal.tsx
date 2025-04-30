import React, { useState, useEffect, useRef } from "react";
import { MoreHorizontal, X } from "lucide-react";
import Modal from "../ui/Modal"; // Adjust path as needed
import ConfirmDialog from "../common/ConfirmDialog"; // Adjust path as needed

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsorName: string;
  sponsorDescription: string;
  onUpdate: (updatedProfile: {
    description: string;
    links: string[];
    newProfilePic: File | null;
  }) => void;
  token: string;
  profileUrl: string;
  links?: string[];
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  sponsorName,
  sponsorDescription,
  onUpdate,
  token,
  profileUrl,
  links = [],
}) => {
  // State variables
  const [about, setAbout] = useState(sponsorDescription);
  const [linksList, setLinksList] = useState<string[]>(links);
  const [newLink, setNewLink] = useState("");
  const [editingLink, setEditingLink] = useState({ index: -1, value: "" });
  const [initialAbout, setInitialAbout] = useState(sponsorDescription);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [currentProfileUrl, setCurrentProfileUrl] = useState(profileUrl);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [linkToRemove, setLinkToRemove] = useState("");
  const [linkError, setLinkError] = useState("");
  const [showPicConfirmation, setShowPicConfirmation] = useState(false);
  const [showLinkWarning, setShowLinkWarning] = useState(false);

  // Use refs to reliably track changes
  const hasChangesRef = useRef({
    about: false,
    links: false,
  });

  useEffect(() => {
    setAbout(sponsorDescription);
    setLinksList(links);
    setCurrentProfileUrl(profileUrl);
    setInitialAbout(sponsorDescription);
    // Reset file selection state when modal opens/closes
    setProfilePicFile(null);
    setPreviewImageUrl(null); // Also reset preview URL
    // Reset change tracking when modal opens/closes
    hasChangesRef.current = {
      about: false,
      links: false,
    };
    // Revoke previous object URL if it exists on modal open/re-render
    // (Defensive coding in case cleanup fails)
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }
  }, [isOpen, links, profileUrl, sponsorDescription]); // Added isOpen dependency

  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
      console.error("Error validating URL:", error);
      return false;
    }
  };

  const handleAddLink = () => {
    if (!newLink.trim()) {
      setLinkError("Please enter a valid URL");
      return;
    }

    if (!isValidUrl(newLink)) {
      setLinkError(
        "Please enter a valid URL starting with http:// or https://"
      );
      return;
    }

    // Add link and set change state
    const newLinksList = [...linksList, newLink];
    setLinksList(newLinksList);
    hasChangesRef.current.links = true;

    console.log("Link added, changes set to true:", hasChangesRef.current);

    setNewLink("");
    setLinkError("");
  };

  const startEditLink = (index: number) => {
    console.log("Starting to edit link at index:", index);
    setEditingLink({ index, value: linksList[index] });
    // Just starting to edit is enough to mark as having unsaved changes
    hasChangesRef.current.links = true;
    console.log(
      "Started editing link, changes set to true:",
      hasChangesRef.current
    );
  };

  const saveEditLink = () => {
    if (!isValidUrl(editingLink.value)) {
      setLinkError(
        "Please enter a valid URL starting with http:// or https://"
      );
      return;
    }

    // Edit link and set change state
    const newLinks = [...linksList];
    newLinks[editingLink.index] = editingLink.value;
    setLinksList(newLinks);
    hasChangesRef.current.links = true;

    setEditingLink({ index: -1, value: "" });
    setLinkError("");
  };

  const cancelEditLink = () => {
    setEditingLink({ index: -1, value: "" });
    setLinkError("");
  };

  const confirmRemoveLink = (linkToRemove: string, e?: React.MouseEvent) => {
    // Only stop propagation but not preventDefault
    if (e) {
      e.stopPropagation();
    }
    setLinkToRemove(linkToRemove);
    setShowConfirmation(true);
  };

  const handleRemoveLink = (e?: React.MouseEvent) => {
    console.log("Removing link:", linkToRemove);

    // Only stop propagation but not preventDefault
    if (e) {
      e.stopPropagation();
    }

    // Remove the link immediately and set change state
    const newLinksList = linksList.filter((link) => link !== linkToRemove);
    setLinksList(newLinksList);
    hasChangesRef.current.links = true;

    // Close the confirmation dialog
    setShowConfirmation(false);
    setLinkToRemove("");
  };

  const handleCancelRemove = () => {
    setShowConfirmation(false);
    setLinkToRemove("");
  };

  // Reset state when modal closes
  const handleModalClose = () => {
    // Reset ref before closing
    hasChangesRef.current = {
      about: false,
      links: false,
    };

    onClose();

    // Reset the state 100ms after the modal closes
    // No need for setTimeout if useEffect handles reset based on isOpen
    // Ensure preview URL is revoked on close
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }
    // Resetting state now handled by useEffect based on isOpen
  };

  const handleSave = async () => {
    // Check if there's text in the newLink input that hasn't been added
    if (newLink.trim()) {
      // Show warning instead of saving
      setShowLinkWarning(true);
      return;
    }

    onUpdate({
      description: about,
      links: linksList,
      newProfilePic: profilePicFile,
    });

    // Reset change tracking after initiating save
    hasChangesRef.current = {
      about: false,
      links: false,
    };

    handleModalClose();
  };

  const handleAddAndSave = () => {
    // Add the link first
    handleAddLink();
    // Then save after a small delay to ensure state is updated
    setTimeout(() => {
      onUpdate({
        description: about,
        links: [...linksList, newLink],
        newProfilePic: profilePicFile,
      });

      // Reset change tracking
      hasChangesRef.current = {
        about: false,
        links: false,
      };

      handleModalClose();
    }, 100);
  };

  const handleProfilePicUpload = async () => {
    if (!profilePicFile || !token) return;

    setUploadingProfilePic(true);

    try {
      const formData = new FormData();
      formData.append("file", profilePicFile);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/pfp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setCurrentProfileUrl(data.photoUrl || data.url);
      setProfilePicFile(null);
      // Clear preview URL after successful upload
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
      // Mark changes after successful upload
      hasChangesRef.current.about = true;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handleProfilePicDelete = async () => {
    if (!token) {
      console.error(
        "Cannot delete profile picture: No authentication token available"
      );
      return;
    }

    console.log("Deleting profile picture...", {
      endpoint: `${
        import.meta.env.VITE_BACKEND_URL
      }/sponsors/${sponsorName}/pfp`,
      method: "DELETE",
    });

    try {
      // Use the API endpoint provided
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/pfp`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Get response text regardless of success/failure
      const responseText = await response.text();
      console.log(
        `Delete profile picture response: ${response.status}`,
        responseText || "(empty response body)"
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete profile picture: ${response.status} ${responseText}`
        );
      }

      console.log("Profile picture deletion successful");

      // Set default image or placeholder
      const placeholderUrl = "/placeholder-logo.png"; // Ensure this path is correct
      setCurrentProfileUrl(placeholderUrl);
      // Mark changes after successful deletion
      hasChangesRef.current.about = true;
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      // Add user feedback here if desired (toast notification, etc.)
      alert(
        "Failed to delete profile picture. Please try again or contact support."
      );
    } finally {
      setShowPicConfirmation(false); // Close confirmation dialog regardless of outcome
    }
  };

  const confirmProfilePicDelete = () => {
    setShowPicConfirmation(true);
  };

  const cancelProfilePicDelete = () => {
    setShowPicConfirmation(false);
  };

  // Handle file selection: Create and set preview URL
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    // Revoke *previous* preview URL if it exists before creating a new one
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }

    setProfilePicFile(file);

    if (file) {
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewImageUrl(newPreviewUrl);
      // Mark changes if a file is selected
      hasChangesRef.current.about =
        hasChangesRef.current.about || currentProfileUrl !== profileUrl;
    } else {
      setPreviewImageUrl(null); // Clear preview if no file selected
      // Mark changes if file selection is cleared (might revert to original)
      hasChangesRef.current.about =
        hasChangesRef.current.about || currentProfileUrl !== profileUrl;
    }
  };

  // Cancel the current file selection (clears preview)
  const cancelFileSelection = () => {
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }
    setProfilePicFile(null);
    setPreviewImageUrl(null);
    // Mark changes if selection is cancelled (might revert to original)
    hasChangesRef.current.about =
      hasChangesRef.current.about || currentProfileUrl !== profileUrl;
  };

  // Cleanup effect for object URL
  useEffect(() => {
    // Return cleanup function to revoke URL on unmount OR when previewImageUrl changes
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]); // Rerun only if previewImageUrl changes

  const modalContent = (
    <>
      {/* Profile Picture Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
        <div className="flex items-start gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-white overflow-hidden shadow-sm">
              <img
                src={previewImageUrl || currentProfileUrl}
                alt={`${sponsorName} Logo Preview`}
                className="max-w-full max-h-full object-contain p-1"
              />
            </div>
            <div className="absolute -bottom-2 -right-2">
              <label
                htmlFor="profile-pic-upload"
                className="bg-bapred text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-opacity-80 transition-colors"
                title="Change picture"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </label>
            </div>
            {previewImageUrl && (
              <button
                onClick={cancelFileSelection}
                className="absolute top-0 right-0 -mt-2 -mr-2 bg-gray-600 text-white w-5 h-5 rounded-full flex items-center justify-center cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Cancel selection"
              >
                <X size={12} />
              </button>
            )}
            <input
              id="profile-pic-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex flex-col">
            <h4 className="text-xl font-bold">{sponsorName}</h4>

            {profilePicFile && (
              <button
                onClick={handleProfilePicUpload}
                disabled={uploadingProfilePic}
                className="px-3 py-1 bg-bapred text-white rounded-md text-sm mt-2 w-fit hover:bg-opacity-80 transition-colors disabled:opacity-50"
              >
                {uploadingProfilePic ? "Uploading..." : "Upload New Picture"}
              </button>
            )}

            {!profilePicFile && (
              <button
                onClick={confirmProfilePicDelete}
                className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm mt-2 w-fit hover:bg-gray-700 transition-colors"
              >
                Remove Picture
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 ml-1">
          Recommended size: 250x250px square image
        </p>
      </div>

      {/* Links Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Links</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newLink}
            onChange={(e) => {
              setNewLink(e.target.value);
              // Mark that we're making changes to links
              if (e.target.value.trim()) {
                hasChangesRef.current.links = true;
              }
            }}
            placeholder="https://example.com"
            className="flex-grow px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleAddLink}
            className="px-4 py-2 bg-bapred text-white rounded-md font-bold"
            title="Add link"
          >
            +
          </button>
        </div>
        {linkError && <p className="text-red-500 text-sm mb-4">{linkError}</p>}

        {editingLink.index !== -1 && (
          <div className="mb-4 p-3 border rounded-md bg-gray-50">
            <h4 className="font-medium mb-2">Edit Link</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingLink.value}
                onChange={(e) => {
                  setEditingLink({ ...editingLink, value: e.target.value });
                  // Force change tracking for link edits
                  hasChangesRef.current.links = true;
                  console.log(
                    "Editing link value, changes set to true:",
                    hasChangesRef.current
                  );
                }}
                className="flex-grow px-3 py-2 border rounded-md"
              />
              <button
                onClick={saveEditLink}
                className="px-3 py-2 bg-green-600 text-white rounded-md"
                title="Save"
              >
                Save
              </button>
              <button
                onClick={cancelEditLink}
                className="px-3 py-2 bg-gray-400 text-white rounded-md"
                title="Cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {linksList.length > 0 && (
          <ul className="overflow-hidden">
            {linksList.map((link, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md"
              >
                <span className="text-black truncate max-w-[80%]">{link}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      startEditLink(index);
                      // Mark as changed when editing a link
                      hasChangesRef.current.links = true;
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                    title="Edit"
                  >
                    <MoreHorizontal size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      confirmRemoveLink(link, e);
                      // Mark as changed when removing a link
                      hasChangesRef.current.links = true;
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                    title="Remove"
                  >
                    <X size={16} className="text-red-600" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* About Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <textarea
          value={about}
          onChange={(e) => {
            const newValue = e.target.value;
            setAbout(newValue);

            // Update ref directly - much more reliable than state
            hasChangesRef.current.about = newValue !== initialAbout;

            console.log("About text changed:", {
              newValue,
              initialAbout,
              hasChanged: hasChangesRef.current.about,
            });
          }}
          onBlur={() => {
            // Use ref directly on blur too
            hasChangesRef.current.about = about !== initialAbout;
            console.log("Textarea blur - ref:", hasChangesRef.current);
          }}
          className="w-full px-3 py-2 border rounded-md min-h-[150px] focus:ring-bapred focus:border-bapred"
          maxLength={500}
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Company description (max 500 characters)</span>
          <span>{about.length}/500</span>
        </div>
      </div>

      {/* Confirmation modals */}
      {showConfirmation && (
        <ConfirmDialog
          isOpen={showConfirmation}
          onClose={() => {
            handleCancelRemove();
          }}
          onConfirm={(e) => {
            handleRemoveLink(e);
          }}
          title="Confirm Removal"
          message="Are you sure you want to remove this link?"
          confirmText="Remove"
          cancelText="Cancel"
          preventOutsideClick={true}
        />
      )}

      {showPicConfirmation && (
        <ConfirmDialog
          isOpen={showPicConfirmation}
          onClose={() => {
            cancelProfilePicDelete();
          }}
          onConfirm={() => {
            handleProfilePicDelete();
          }}
          title="Confirm Deletion"
          message="Are you sure you want to remove this profile picture?"
          confirmText="Remove"
          cancelText="Cancel"
          preventOutsideClick={true}
        />
      )}

      {/* Link warning dialog */}
      {showLinkWarning && (
        <ConfirmDialog
          isOpen={showLinkWarning}
          onClose={() => {
            setShowLinkWarning(false);
            // Just save without the link
            onUpdate({
              description: about,
              links: linksList,
              newProfilePic: null, // Assuming discard means no new pic either
            });
            handleModalClose();
          }}
          onConfirm={() => {
            handleAddAndSave();
          }}
          title="Unsaved Link"
          message={`You have text in the link field that hasn't been added: "${newLink}". Would you like to add it before saving?`}
          confirmText="Add & Save"
          cancelText="Discard Link"
          preventOutsideClick={true}
        />
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Edit Profile"
      onConfirm={handleSave}
      confirmText="Save Changes"
      cancelText="Cancel"
      showFooter={true}
      size="lg"
    >
      {modalContent}
    </Modal>
  );
};

export default ProfileEditModal;
