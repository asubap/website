import React, { useState, useEffect, useCallback } from "react";
import { MoreHorizontal, X } from "lucide-react";
import Modal from "../ui/Modal"; // Adjust path as needed
import ConfirmDialog from "../common/ConfirmDialog"; // Adjust path as needed

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
  // State variables
  const [about, setAbout] = useState(sponsorDescription);
  const [linksList, setLinksList] = useState<string[]>(links);
  const [newLink, setNewLink] = useState("");
  const [editingLink, setEditingLink] = useState({ index: -1, value: "" });
  const [initialAbout, setInitialAbout] = useState(sponsorDescription);
  const [initialLinks, setInitialLinks] = useState<string[]>([...links]);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [currentProfileUrl, setCurrentProfileUrl] = useState(profileUrl);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [linkToRemove, setLinkToRemove] = useState("");
  const [linkError, setLinkError] = useState("");
  const [showPicConfirmation, setShowPicConfirmation] = useState(false);
  const [showLinkWarning, setShowLinkWarning] = useState(false);

  // Memoize hasUnsavedChanges as it's used in a useEffect dependency array
  // and its own dependencies are clear.
  const hasUnsavedChanges = useCallback(() => {
    const aboutChanged = about !== initialAbout;
    const linksChanged =
      JSON.stringify(linksList) !== JSON.stringify(initialLinks);
    const picChanged = !!profilePicFile;
    const newLinkNotEmpty = newLink.trim() !== "";
    return aboutChanged || linksChanged || picChanged || newLinkNotEmpty;
  }, [about, initialAbout, linksList, initialLinks, profilePicFile, newLink]);

  useEffect(() => {
    setAbout(sponsorDescription);
    setLinksList([...links]);
    setInitialAbout(sponsorDescription);
    setInitialLinks([...links]);

    // Add a cache-busting parameter to ensure fresh image loads when modal opens
    setCurrentProfileUrl(`${profileUrl}?t=${Date.now()}`);
    setProfilePicFile(null);
    setPreviewImageUrl(null);
    // Revoke previous object URL if it exists on modal open/re-render
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }
  }, [isOpen, links, profileUrl, sponsorDescription]);

  // Effect for handling 'beforeunload' confirmation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // No need to check isOpen here as the effect runs conditionally based on isOpen
      event.preventDefault();
      event.returnValue = ""; // For Chrome/Edge
      return ""; // For Firefox/legacy
    };

    if (isOpen && hasUnsavedChanges()) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
    // No explicit else needed to remove, as a new effect run without the condition
    // will execute the cleanup from the previous run that added the listener.
    // However, explicitly removing if the condition is false is clearer.
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload); // Ensure cleanup in all paths
    };
  }, [isOpen, hasUnsavedChanges]); // hasUnsavedChanges is now a stable useCallback-wrapped function

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

  const confirmRemoveLink = (linkToRemove: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setLinkToRemove(linkToRemove);
    setShowConfirmation(true);
  };

  const handleRemoveLink = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setLinksList((prevLinks) =>
      prevLinks.filter((link) => link !== linkToRemove)
    );

    setShowConfirmation(false);
    setLinkToRemove("");
  };

  const handleCancelRemove = () => {
    setShowConfirmation(false);
    setLinkToRemove("");
  };

  const proceedWithClose = () => {
    onClose();

    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }
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
      setShowLinkWarning(true);
      return;
    }

    onUpdate({
      description: about,
      links: linksList,
      newProfilePic: profilePicFile,
    });

    setInitialAbout(about);
    setInitialLinks([...linksList]);
    if (profilePicFile) {
      setProfilePicFile(null);
    }
    proceedWithClose();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewImageUrl(newPreviewUrl);
    setProfilePicFile(file);

    await handleProfilePicUpload(file);
  };

  const handleProfilePicUpload = async (fileToUpload: File | null = null) => {
    const fileToUse = fileToUpload || profilePicFile;

    if (!fileToUse || !token) return;

    setUploadingProfilePic(true);

    try {
      const formData = new FormData();
      formData.append("file", fileToUse);

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

      const imageUrl = data.photoUrl || data.url;
      setCurrentProfileUrl(`${imageUrl}?t=${Date.now()}`);

      setProfilePicFile(null);

      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
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
    setPreviewImageUrl(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorName}/pfp`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Failed to delete profile picture: ${response.status} ${responseText}`
        );
      }

      const placeholderUrl = "/placeholder-logo.png";
      setCurrentProfileUrl(placeholderUrl);
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      alert(
        "Failed to delete profile picture. Please try again or contact support."
      );
    } finally {
      setShowPicConfirmation(false);
    }
  };

  const cancelProfilePicDelete = () => {
    setShowPicConfirmation(false);
  };

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const modalContent = (
    <div className="max-h-[70vh] overflow-y-auto px-2">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
        <div className="flex items-start gap-6">
          {uploadingProfilePic && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
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
              className={`bg-bapred text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-opacity-80 transition-colors ${
                uploadingProfilePic ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={uploadingProfilePic ? "Uploading..." : "Change picture"}
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
          <input
            id="profile-pic-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploadingProfilePic}
          />
        </div>
        <p className="text-xs text-gray-500 mt-3 ml-1">
          Recommended size: 250x250px square image
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Links</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newLink}
            onChange={(e) => {
              setNewLink(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevent form submission or other default behavior
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
                onChange={(e) => {
                  setEditingLink({ ...editingLink, value: e.target.value });
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
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                    title="Edit"
                  >
                    <MoreHorizontal size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      confirmRemoveLink(link, e);
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

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <textarea
          value={about}
          onChange={(e) => {
            const newValue = e.target.value;
            setAbout(newValue);
          }}
          onBlur={() => {
            // DO NOT setInitialAbout(about) here.
            // Changes are detected by comparing `about` with `initialAbout` (set on modal open).
          }}
          className="w-full px-3 py-2 border rounded-md min-h-[150px] focus:ring-bapred focus:border-bapred"
          maxLength={500}
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Company description (max 500 characters)</span>
          <span>{about.length}/500</span>
        </div>
      </div>

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

      {showLinkWarning && (
        <ConfirmDialog
          isOpen={showLinkWarning}
          onClose={() => {
            setShowLinkWarning(false);
            setNewLink("");
            setLinkError("");
            onUpdate({
              description: about,
              links: linksList,
              newProfilePic: profilePicFile,
            });
            setInitialAbout(about);
            setInitialLinks([...linksList]);
            if (profilePicFile) {
              setProfilePicFile(null);
            }
            proceedWithClose();
          }}
          onConfirm={() => {
            setShowLinkWarning(false);
            const linkValueFromState = newLink;
            const linkToBeAdded = linkValueFromState.trim();

            if (!linkToBeAdded) {
              console.warn(
                "[ProfileEditModal] Link to be added was empty after trim. Discarding it and saving other changes."
              );
              setNewLink("");
              setLinkError("");
              onUpdate({
                description: about,
                links: linksList,
                newProfilePic: profilePicFile,
              });
              setInitialAbout(about);
              setInitialLinks([...linksList]);
              if (profilePicFile) {
                setProfilePicFile(null);
              }
              proceedWithClose();
              return;
            }

            setNewLink("");
            setLinkError("");
            setLinksList((prevLinksList) => [...prevLinksList, linkToBeAdded]);

            const finalLinksForSave = [...linksList, linkToBeAdded];

            onUpdate({
              description: about,
              links: finalLinksForSave,
              newProfilePic: profilePicFile,
            });

            setInitialAbout(about);
            setInitialLinks(finalLinksForSave);
            if (profilePicFile) {
              setProfilePicFile(null);
            }
            proceedWithClose();
          }}
          title="Unadded Link"
          message={`You have a link "${newLink}" in the input field that hasn't been added to the list. What would you like to do?`}
          confirmText="Add Link and Save All"
          cancelText="Discard Link and Save All"
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
          >
            Save Changes
          </button>
        </div>
      }
    >
      {modalContent}
    </Modal>
  );
};

export default ProfileEditModal;
