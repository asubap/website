import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog"; // Assuming ConfirmDialog is in the same common folder

interface ProfilePictureUploadProps {
  currentProfileUrl: string | null;
  onFileSelect: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  uploading: boolean;
  altText: string;
  showDeleteConfirmationDialog: (show: boolean) => void;
  isDeleteConfirmationDialogVisible: boolean;
  confirmDeleteAction: () => void;
  cancelDeleteAction: () => void;
  recommendedSizeText?: string;
  placeholderImageUrl?: string;
  imageContainerClassName?: string;
  imageClassName?: string;
  uploadButtonClassName?: string;
  deleteButtonClassName?: string;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentProfileUrl,
  onFileSelect,
  onDelete,
  uploading,
  altText,
  showDeleteConfirmationDialog,
  isDeleteConfirmationDialogVisible,
  confirmDeleteAction,
  cancelDeleteAction,
  recommendedSizeText = "Recommended size: 250x250px square image",
  placeholderImageUrl = "/placeholder-logo.png", // Default placeholder
  imageContainerClassName = "w-24 h-24 rounded-md border flex items-center justify-center bg-white shadow-sm",
  imageClassName = "max-w-full max-h-full object-contain",
  uploadButtonClassName = "bg-bapred text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-opacity-80 transition-colors",
  deleteButtonClassName = "bg-gray-700 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-opacity-80 transition-colors",
}) => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      const newPreview = URL.createObjectURL(file);
      setPreviewImageUrl(newPreview);
      try {
        await onFileSelect(file);
        // If onFileSelect is successful, we assume the parent will update currentProfileUrl.
        // No need to clear previewImageUrl here immediately unless onFileSelect clears it or changes it.
      } catch (error) {
        console.error("Error in onFileSelect handler:", error);
        // Optionally revert preview or show an error
        URL.revokeObjectURL(newPreview);
        setPreviewImageUrl(null);
      }
    }
    // Reset the input value to allow selecting the same file again if needed
    event.target.value = "";
  };

  const effectiveImageUrl =
    previewImageUrl || currentProfileUrl || placeholderImageUrl;
  const canDelete = !!(
    currentProfileUrl && currentProfileUrl !== placeholderImageUrl
  );

  return (
    <div className="relative">
      <div className={`relative ${imageContainerClassName}`}>
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        <img
          src={effectiveImageUrl}
          alt={altText}
          className={imageClassName}
          onError={(e) => {
            // If currentProfileUrl (or preview) fails to load, show placeholder
            if (effectiveImageUrl !== placeholderImageUrl) {
              (e.target as HTMLImageElement).src = placeholderImageUrl;
            }
          }}
        />
        {/* Upload Button */}
        <label
          htmlFor="profile-pic-upload-reusable"
          className={`absolute -bottom-3 -right-3 z-10 ${uploadButtonClassName} ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title={uploading ? "Uploading..." : "Change picture"}
        >
          <Plus size={16} />
        </label>
        <input
          id="profile-pic-upload-reusable"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {/* Delete Button */}
        {canDelete && !uploading && (
          <button
            type="button"
            onClick={() => showDeleteConfirmationDialog(true)}
            className={`absolute -top-3 -right-3 z-10 ${deleteButtonClassName}`}
            title="Remove picture"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {recommendedSizeText && (
        <p className="text-xs text-gray-500 mt-3 ml-1">{recommendedSizeText}</p>
      )}

      {isDeleteConfirmationDialogVisible && (
        <ConfirmDialog
          isOpen={isDeleteConfirmationDialogVisible}
          onClose={() => {
            cancelDeleteAction();
            showDeleteConfirmationDialog(false);
          }}
          onConfirm={() => {
            confirmDeleteAction();
            onDelete().finally(() => {
              setPreviewImageUrl(null); // Clear preview after delete attempt
            });
            showDeleteConfirmationDialog(false);
          }}
          title="Confirm Deletion"
          message="Are you sure you want to remove this profile picture?"
          confirmText="Remove"
          cancelText="Cancel"
          preventOutsideClick={true}
        />
      )}
    </div>
  );
};

export default ProfilePictureUpload;
