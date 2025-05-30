import React, { useState, useEffect, useCallback } from "react";
import { MoreHorizontal, X } from "lucide-react";
import Modal from "../ui/Modal"; // Adjust path as needed
import ConfirmDialog from "../common/ConfirmDialog"; // Adjust path as needed
import ProfilePictureUpload from "../common/ProfilePictureUpload"; // Import the new component

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  showDiscardConfirmation: (
    title: string,
    message: string,
    onConfirmDiscard: () => void
  ) => void;
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
  showDiscardConfirmation,
  sponsorName,
  sponsorDescription = "",
  onUpdate,
  token,
  profileUrl,
  links = [],
}) => {
  // State variables for text fields and links
  const [about, setAbout] = useState(sponsorDescription);
  const [linksList, setLinksList] = useState<string[]>(links);
  const [newLink, setNewLink] = useState("");
  const [editingLink, setEditingLink] = useState({ index: -1, value: "" });
  const [initialAbout, setInitialAbout] = useState(sponsorDescription);
  const [initialLinks, setInitialLinks] = useState<string[]>([...links]);
  const [linkError, setLinkError] = useState("");
  const [showLinkWarning, setShowLinkWarning] = useState(false);
  const [showLinkRemoveConfirmation, setShowLinkRemoveConfirmation] =
    useState(false);
  const [linkToRemove, setLinkToRemove] = useState("");

  // State variables for ProfilePictureUpload
  const [currentPfpUrl, setCurrentPfpUrl] = useState(profileUrl);
  const [profilePicFileForUpload, setProfilePicFileForUpload] =
    useState<File | null>(null);
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);
  const [showPfpDeleteConfirm, setShowPfpDeleteConfirm] = useState(false);

  const hasUnsavedChanges = useCallback(() => {
    const aboutChanged = about !== initialAbout;
    const linksChanged =
      JSON.stringify(linksList) !== JSON.stringify(initialLinks);
    const picChanged = !!profilePicFileForUpload; // Check if a new pic is staged
    const newLinkNotEmpty = newLink.trim() !== "";
    return aboutChanged || linksChanged || picChanged || newLinkNotEmpty;
  }, [
    about,
    initialAbout,
    linksList,
    initialLinks,
    profilePicFileForUpload,
    newLink,
  ]);

  useEffect(() => {
    if (isOpen) {
      setAbout(sponsorDescription);
      setLinksList([...links]);
      setInitialAbout(sponsorDescription);
      setInitialLinks([...links]);
      setCurrentPfpUrl(`${profileUrl}?t=${Date.now()}`);
      setProfilePicFileForUpload(null);
      // Reset other states as needed
      setNewLink("");
      setEditingLink({ index: -1, value: "" });
      setLinkError("");
      setShowLinkWarning(false);
      setShowLinkRemoveConfirmation(false);
      setLinkToRemove("");
      setIsUploadingPfp(false);
      setShowPfpDeleteConfirm(false);
    }
  }, [isOpen, sponsorDescription, links, profileUrl]);

  // Effect for handling 'beforeunload' confirmation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    if (isOpen && hasUnsavedChanges()) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isOpen, hasUnsavedChanges]);

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
    const trimmedNewLink = newLink.trim();
    if (!trimmedNewLink) {
      setLinkError("Link URL cannot be empty.");
      return;
    }
    if (!isValidUrl(trimmedNewLink)) {
      setLinkError(
        "Please enter a valid URL starting with http:// or https://"
      );
      return;
    }
    setLinksList((prevLinks) => [...prevLinks, trimmedNewLink]);
    setNewLink("");
    setLinkError("");
  };

  const startEditLink = (index: number) => {
    setEditingLink({ index, value: linksList[index] });
  };

  const saveEditLink = () => {
    if (!isValidUrl(editingLink.value)) {
      setLinkError(
        "Please enter a valid URL starting with http:// or https://"
      );
      return;
    }
    const newLinks = [...linksList];
    newLinks[editingLink.index] = editingLink.value;
    setLinksList(newLinks);
    setEditingLink({ index: -1, value: "" });
    setLinkError("");
  };

  const cancelEditLink = () => {
    setEditingLink({ index: -1, value: "" });
    setLinkError("");
  };

  const confirmRemoveLink = (link: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLinkToRemove(link);
    setShowLinkRemoveConfirmation(true);
  };

  const executeRemoveLink = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLinksList((prevLinks) => prevLinks.filter((l) => l !== linkToRemove));
    setShowLinkRemoveConfirmation(false);
    setLinkToRemove("");
  };

  const cancelRemoveLink = () => {
    setShowLinkRemoveConfirmation(false);
    setLinkToRemove("");
  };

  const proceedWithClose = () => {
    onClose();
    // Cleanup related to ProfilePictureUpload's preview is handled within it or via its props
  };

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges()) {
      showDiscardConfirmation(
        "Discard Unsaved Changes?",
        "You have unsaved changes. Are you sure you want to discard them and close the editor?",
        proceedWithClose
      );
    } else {
      proceedWithClose();
    }
  };

  const handleSave = async () => {
    const currentNewLinkTrimmed = newLink.trim();
    if (currentNewLinkTrimmed) {
      if (!isValidUrl(currentNewLinkTrimmed)) {
        setLinkError(
          "Please enter a valid URL starting with http:// or https://"
        );
        return;
      }
      setShowLinkWarning(true); // Show warning if there's an unadded link
      return;
    }

    // The onUpdate prop now primarily handles text and links.
    // Profile picture update is handled by its own component's handlers.
    onUpdate({
      description: about,
      links: linksList,
      newProfilePic: profilePicFileForUpload, // Pass the staged file
    });

    setInitialAbout(about);
    setInitialLinks([...linksList]);
    setProfilePicFileForUpload(null); // Clear staged file after attempting save
    proceedWithClose();
  };

  // Handler for ProfilePictureUpload onFileSelect
  const handlePfpFileSelect = async (file: File) => {
    if (!token) return;
    setIsUploadingPfp(true);
    setProfilePicFileForUpload(file); // Stage the file for the main save

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/pfp`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const newImageUrl = `${data.photoUrl || data.url}?t=${Date.now()}`;
      setCurrentPfpUrl(newImageUrl);
      // Successfully uploaded, so the `profilePicFileForUpload` is no longer "new" in the sense of needing to be passed to onUpdate's newProfilePic.
      // However, we keep it to indicate a change was made for `hasUnsavedChanges` until modal save.
      // Or, clear it if the parent's `onUpdate` for description/links doesn't need it anymore.
      // For now, let's assume onUpdate might still want to know if *any* pfp change was initiated.
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert(error instanceof Error ? error.message : "Upload failed");
      setProfilePicFileForUpload(null); // Clear if upload failed
      // Potentially revert currentPfpUrl if needed, or let user retry
    } finally {
      setIsUploadingPfp(false);
    }
  };

  // Handler for ProfilePictureUpload onDelete
  const handlePfpDelete = async () => {
    if (!token) return;
    setIsUploadingPfp(true); // Visually indicate activity for delete as well

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/pfp`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(
          `Failed to delete profile picture: ${response.status} ${responseText}`
        );
      }
      setCurrentPfpUrl("/placeholder-logo.png"); // Update to placeholder
      setProfilePicFileForUpload(null); // Clear any staged file
      // Also update initial state if this modal doesn't close immediately
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete profile picture. Please try again."
      );
    } finally {
      setIsUploadingPfp(false);
      setShowPfpDeleteConfirm(false);
    }
  };

  const modalContent = (
    <div className="max-h-[70vh] overflow-y-auto px-2">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
        <ProfilePictureUpload
          currentProfileUrl={currentPfpUrl}
          onFileSelect={handlePfpFileSelect}
          onDelete={handlePfpDelete}
          uploading={isUploadingPfp}
          altText={`${sponsorName} Logo`}
          showDeleteConfirmationDialog={setShowPfpDeleteConfirm}
          isDeleteConfirmationDialogVisible={showPfpDeleteConfirm}
          confirmDeleteAction={() => {
            /* onDelete handles the logic */
          }}
          cancelDeleteAction={() => setShowPfpDeleteConfirm(false)}
          // placeholderImageUrl might be different for sponsors if needed
        />
      </div>

      {/* Links Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Links</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddLink();
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
                onChange={(e) =>
                  setEditingLink({ ...editingLink, value: e.target.value })
                }
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
                    onClick={() => startEditLink(index)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                    title="Edit"
                  >
                    <MoreHorizontal size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => confirmRemoveLink(link, e)}
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
          onChange={(e) => setAbout(e.target.value)}
          className="w-full px-3 py-2 border rounded-md min-h-[150px] focus:ring-bapred focus:border-bapred"
          maxLength={500}
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Company description (max 500 characters)</span>
          <span>{`${about.length}/500`}</span>
        </div>
      </div>

      {/* Confirmation Dialog for Removing Link */}
      {showLinkRemoveConfirmation && (
        <ConfirmDialog
          isOpen={showLinkRemoveConfirmation}
          onClose={cancelRemoveLink}
          onConfirm={executeRemoveLink}
          title="Confirm Removal"
          message={`Are you sure you want to remove the link: ${linkToRemove}?`}
          confirmText="Remove"
          cancelText="Cancel"
          preventOutsideClick={true}
        />
      )}

      {/* Confirmation Dialog for Unadded Link on Save */}
      {showLinkWarning && (
        <ConfirmDialog
          isOpen={showLinkWarning}
          onClose={() => {
            setShowLinkWarning(false);
            setNewLink("");
            setLinkError("");
            // Discard link and save other changes
            onUpdate({
              description: about,
              links: linksList,
              newProfilePic: profilePicFileForUpload,
            });
            setInitialAbout(about);
            setInitialLinks([...linksList]);
            setProfilePicFileForUpload(null);
            proceedWithClose();
          }}
          onConfirm={() => {
            // Add link and save all changes
            setShowLinkWarning(false);
            const linkValueFromState = newLink.trim();
            setNewLink("");
            setLinkError("");

            let finalLinksForSave = [...linksList];
            if (linkValueFromState && isValidUrl(linkValueFromState)) {
              finalLinksForSave = [...linksList, linkValueFromState];
              setLinksList(finalLinksForSave);
            } else if (linkValueFromState && !isValidUrl(linkValueFromState)) {
              // If it's not a valid URL but was typed, it's tricky.
              // For now, we'll ignore it if it's invalid rather than blocking save.
              // Or, you could show an error and not proceed.
              console.warn(
                "Attempted to save an invalid link from input field. Discarding it."
              );
            }

            onUpdate({
              description: about,
              links: finalLinksForSave,
              newProfilePic: profilePicFileForUpload,
            });
            setInitialAbout(about);
            setInitialLinks(finalLinksForSave);
            setProfilePicFileForUpload(null);
            proceedWithClose();
          }}
          title="Unadded Link"
          message={`You have a link "${newLink}" in the input field that hasn't been added. Add it before saving?`}
          confirmText="Add Link and Save"
          cancelText="Discard Link and Save"
          preventOutsideClick={true}
        />
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseAttempt}
      title={`Edit ${sponsorName} Profile`}
      footer={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCloseAttempt}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bapred"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-bapred border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bapred"
            disabled={isUploadingPfp} // Disable save if PFP is currently uploading
          >
            {isUploadingPfp ? "Uploading..." : "Save Changes"}
          </button>
        </div>
      }
    >
      {modalContent}
    </Modal>
  );
};

export default ProfileEditModal;
