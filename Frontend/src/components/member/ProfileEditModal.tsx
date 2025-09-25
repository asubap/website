import type React from "react";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../context/auth/authProvider";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../context/toast/ToastContext";
import ProfilePictureUpload from "../../components/common/ProfilePictureUpload";
import { MemberDetail } from "../../types";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: MemberDetail;
  onSave: (formData: MemberDetail) => void;
  showRank?: boolean;
  showRole?: boolean;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  profileData,
  onSave,
  showRank = false,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<MemberDetail>(profileData);
  const initialDataRef = useRef<MemberDetail>(profileData);
  const [showDiscardConfirmDialog, setShowDiscardConfirmDialog] =
    useState(false);
  const [isClient, setIsClient] = useState(false);

  const [currentPfpUrl, setCurrentPfpUrl] = useState<string | null>(
    profileData.photoUrl || null
  );
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);
  const [showPfpDeleteConfirm, setShowPfpDeleteConfirm] = useState(false);
  const { session } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setFormData(profileData);
      initialDataRef.current = profileData;
      if (profileData.photoUrl) {
        setCurrentPfpUrl(`${profileData.photoUrl}?t=${Date.now()}`);
      } else {
        setCurrentPfpUrl(null);
      }
      setIsUploadingPfp(false);
      setShowPfpDeleteConfirm(false);
    }
  }, [isOpen, profileData]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasUnsavedChanges = () => {
    const formChanged =
      JSON.stringify({
        ...formData,
        photoUrl: undefined,
      }) !==
      JSON.stringify({
        ...initialDataRef.current,
        photoUrl: undefined,
      });

    return formChanged;
  };

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges()) {
      setShowDiscardConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirmDialog(false);
    onClose();
  };

  const handleCancelDiscard = () => {
    setShowDiscardConfirmDialog(false);
  };

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePfpFileSelect = async (file: File) => {
    if (!session?.access_token) {
      showToast("Authentication error.", "error");
      return;
    }
    setIsUploadingPfp(true);

    try {
      const token = session.access_token;
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/member-info/${
          profileData.email
        }/pfp`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadFormData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to upload photo");
      }

      const data = await uploadResponse.json();
      const newPhotoUrl = `${data.photoUrl}?t=${Date.now()}`;
      setCurrentPfpUrl(newPhotoUrl);
      setFormData((prev) => ({
        ...prev,
        photoUrl: data.photoUrl,
      }));
      showToast("Profile picture uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading photo:", error);
      showToast(
        error instanceof Error ? error.message : "Upload failed",
        "error"
      );
    } finally {
      setIsUploadingPfp(false);
    }
  };

  const handlePfpDelete = async () => {
    if (!session?.access_token) {
      showToast("Authentication error.", "error");
      return;
    }
    setIsUploadingPfp(true);

    try {
      const token = session.access_token;
      const deleteResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/member-info/${
          profileData.email
        }/pfp`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to delete photo");
      }

      showToast("Profile picture deleted successfully!", "success");
      setCurrentPfpUrl(null);
      setFormData((prev) => ({
        ...prev,
        photoUrl: "",
      }));
    } catch (error) {
      console.error("Error deleting photo:", error);
      showToast("Failed to delete profile picture. Please try again.", "error");
    } finally {
      setIsUploadingPfp(false);
      setShowPfpDeleteConfirm(false);
    }
  };

  const handleSubmit = async () => {
    const requiredFields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.major,
      formData.graduationDate,
      formData.status,
      formData.about,
    ];
    const fieldNames = [
      "Name",
      "Email",
      "Phone Number",
      "Major(s)",
      "Graduation Date",
      "Status",
      "About",
    ];
    for (let i = 0; i < requiredFields.length; i++) {
      if (!requiredFields[i] || requiredFields[i] === "N/A") {
        showToast(
          `${fieldNames[i]} is required and cannot be empty or 'N/A'.`,
          "error"
        );
        return;
      }
    }

    // Check if profile picture is required
    if (!currentPfpUrl) {
      showToast("Profile picture is required. Please upload a profile picture before saving.", "error");
      return;
    }

    if (
      !hasUnsavedChanges() &&
      currentPfpUrl === initialDataRef.current.photoUrl
    ) {
      onClose();
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/member-info/edit-member-info/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            user_email: formData.email,
            about: formData.about,
            name: formData.name,
            graduating_year: formData.graduationDate,
            major: formData.major,
            phone: formData.phone,
            member_status: formData.status,
            member_rank: formData.rank,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }
      initialDataRef.current = { ...formData, photoUrl: currentPfpUrl || "" };
      onSave({ ...formData, photoUrl: currentPfpUrl || "" });
      showToast("Profile updated successfully!", "success");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to update profile.",
        "error"
      );
    }
  };

  const formContent = (
    <div className="flex flex-col overflow-y-auto max-h-[60vh] sm:max-h-[75vh] p-1">
      <div className="w-full flex pl-6 pr-6 pb-4 pt-4">
        <ProfilePictureUpload
          currentProfileUrl={currentPfpUrl}
          onFileSelect={handlePfpFileSelect}
          onDelete={handlePfpDelete}
          uploading={isUploadingPfp}
          altText="Profile Preview"
          showDeleteConfirmationDialog={setShowPfpDeleteConfirm}
          isDeleteConfirmationDialogVisible={showPfpDeleteConfirm}
          confirmDeleteAction={() => {}}
          cancelDeleteAction={() => setShowPfpDeleteConfirm(false)}
          recommendedSizeText="Recommended: Square image (e.g., 250x250px)"
          placeholderImageUrl="/default-avatar.png"
        />
      </div>

      <div className="w-full p-6 pt-0 md:pt-2">
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4 text-center md:text-left">
            Profile
          </h3>

          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-[#d9d9d9] rounded-lg p-3"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="border border-[#d9d9d9] rounded-lg p-3 w-full"
                required
                disabled
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="border border-[#d9d9d9] rounded-lg p-3 w-full"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label
                htmlFor="major"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Major(s) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="major"
                name="major"
                placeholder="Major(s)"
                value={formData.major}
                onChange={handleChange}
                className="border border-[#d9d9d9] rounded-lg p-3 w-full"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="graduationDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Graduation Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="graduationDate"
                name="graduationDate"
                placeholder="Graduation Date"
                value={formData.graduationDate}
                onChange={handleChange}
                className="border border-[#d9d9d9] rounded-lg p-3 w-full"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="appearance-none border border-[#d9d9d9] rounded-lg p-3 w-full pr-10"
              >
                <option value="">Status</option>
                <option value="Looking for Internship">
                  Looking for Internship
                </option>
                <option value="Looking for Full-time">
                  Looking for Full-time
                </option>
                <option value="Not Looking">Not Looking</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none mt-3.5"
                size={16}
              />
            </div>
            {showRank && (
              <div className="flex-1 relative">
                <label
                  htmlFor="rank"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Member Rank <span className="text-red-500">*</span>
                </label>
                <select
                  id="rank"
                  name="rank"
                  value={formData.rank}
                  onChange={handleChange}
                  className="appearance-none border border-[#d9d9d9] rounded-lg p-3 w-full pr-10"
                >
                  <option value="">Select Rank</option>
                  {/* <option value="current">Current</option> */}
                  <option value="pledge">Pledge</option>
                  <option value="alumni">Alumni</option>
                  <option value="inducted">Inducted</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none mt-3.5"
                  size={16}
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="about"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              About <span className="text-red-500">*</span>
            </label>
            <textarea
              id="about"
              name="about"
              placeholder="Write about yourself..."
              value={formData.about}
              onChange={handleChange}
              className="w-full border border-[#d9d9d9] rounded-lg p-3 min-h-[150px]"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseAttempt}
      title="Update Profile"
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
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-bapred border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bapred"
            disabled={isUploadingPfp}
          >
            {isUploadingPfp ? "Uploading..." : "Save Changes"}
          </button>
        </div>
      }
    >
      {isClient && showDiscardConfirmDialog && (
        <ConfirmDialog
          isOpen={showDiscardConfirmDialog}
          onClose={handleCancelDiscard}
          onConfirm={handleConfirmDiscard}
          title="Discard Unsaved Changes?"
          message="You have unsaved changes. Are you sure you want to discard them and close the editor?"
          confirmText="Discard"
          cancelText="Keep Editing"
        />
      )}
      <div className="p-6">{formContent}</div>
    </Modal>
  );
}
