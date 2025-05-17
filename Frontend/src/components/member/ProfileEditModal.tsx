import type React from "react";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../context/auth/authProvider";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../context/toast/ToastContext";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  major: string;
  graduationDate: string;
  status: string;
  about: string;
  internship: string;
  photoUrl: string;
  hours: string;
  rank: string; // Add this new field
};

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onSave: (formData: ProfileData) => void;
}

// Add environment variable for backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ProfileEditModal({
  isOpen,
  onClose,
  profileData,
  onSave,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<ProfileData>(profileData);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    profileData.photoUrl || null
  );
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [showPicConfirmation, setShowPicConfirmation] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const { session } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && profileData.photoUrl) {
      setPhotoPreview(`${profileData.photoUrl}?t=${Date.now()}`);
    }
  }, [isOpen, profileData.photoUrl]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    setUploadingProfilePic(true);

    try {
      const token = session?.access_token;
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch(
        `${BACKEND_URL}/member-info/${profileData.email}/pfp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload photo");
      }

      const data = await uploadResponse.json();

      setPhotoPreview(`${data.photoUrl}?t=${Date.now()}`);

      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const confirmProfilePicDelete = () => {
    setShowPicConfirmation(true);
  };

  const cancelProfilePicDelete = () => {
    setShowPicConfirmation(false);
  };

  const handlePhotoDelete = async () => {
    try {
      setUploadingProfilePic(true);
      const token = session?.access_token;

      const deleteResponse = await fetch(
        `${BACKEND_URL}/member-info/${profileData.email}/pfp`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete photo");
      }

      setPhotoPreview(null);
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete profile picture. Please try again.");
    } finally {
      setUploadingProfilePic(false);
      setShowPicConfirmation(false);
    }
  };

  const handleSubmit = async () => {
    onSave(formData);
    console.log(formData.internship);
    console.log(formData.status);
    try {
      const response = await fetch(`${BACKEND_URL}/member-info/edit-member-info/`, {
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
      });

      const data = await response.json();
      
      // Debug: log the API response
      console.log("API response:", data);
      
      if (!response.ok) {
        if (data.error === "Validation failed" && (data.details || data.detail || data.message)) {
          const errorMessage =
            (Array.isArray(data.details) && data.details.join(", ")) ||
            data.detail ||
            data.message ||
            "Validation failed";
          showToast(errorMessage, "error");
          return;
        }
        showToast(data.error || data.message || "Failed to update profile", "error");
        return;
      }

      showToast("Profile updated successfully!", "success");
      onClose();
    } catch (error) {
      console.error("Error editing:", error);
      showToast(error instanceof Error ? error.message : "Failed to update profile", "error");
    }
  };

  const formContent = (
    <div className="flex flex-col overflow-y-auto max-h-[60vh] sm:max-h-[75vh] p-1">
      <div className="w-full flex justify-center items-center p-6 pt-4 md:pt-6">
        <div className="relative group">
          {uploadingProfilePic && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
          <div className="w-36 h-36 bg-[#d9d9d9] rounded-full flex items-center justify-center overflow-hidden mb-4">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-sm text-gray-500">
                <div>No Photo</div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <label
              className={`px-4 py-2 bg-[#af272f] text-white rounded-full hover:bg-[#8f1f26] transition-colors cursor-pointer text-center text-sm ${
                uploadingProfilePic ? "opacity-60 cursor-not-allowed" : ""
              }`}
              title={uploadingProfilePic ? "Uploading..." : "Choose a profile photo"}
            >
              {uploadingProfilePic ? "Uploading..." : "Upload Profile Photo"}
              <input
                accept="image/*"
                className="hidden"
                aria-label="Upload profile photo"
                type="file"
                onChange={handlePhotoUpload}
                disabled={uploadingProfilePic}
              />
            </label>
            {photoPreview && !uploadingProfilePic && (
              <button
                onClick={confirmProfilePicDelete}
                className="px-4 py-2 border border-[#d9d9d9] rounded-full text-[#202020] hover:bg-gray-100 transition-colors text-sm"
                disabled={uploadingProfilePic}
              >
                Delete Photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full p-6 pt-0 md:pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-center md:text-left">
              Profile
            </h3>

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
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
                  Email
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
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <div className="sm:col-span-1">
                <label
                  htmlFor="major"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Major(s)
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
              <div>
                <label
                  htmlFor="graduationDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Grad Date
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
              <div className="relative">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
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
              
              <div className="relative">
                <label
                  htmlFor="rank"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Member Rank
                </label>
                <select
                  id="rank"
                  name="rank"
                  value={formData.rank}
                  onChange={handleChange}
                  className="appearance-none border border-[#d9d9d9] rounded-lg p-3 w-full pr-10"
                >
                  <option value="">Select Rank</option>
                  <option value="current">Current</option>
                  <option value="pledge">Pledge</option>
                  <option value="alumni">Alumni</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none mt-3.5"
                  size={16}
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="about"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                About
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
        </form>
      </div>

      {showPicConfirmation && (
        <ConfirmDialog
          isOpen={showPicConfirmation}
          onClose={cancelProfilePicDelete}
          onConfirm={handlePhotoDelete}
          title="Confirm Deletion"
          message="Are you sure you want to remove your profile picture?"
          confirmText="Remove"
          cancelText="Cancel"
          preventOutsideClick={true}
        />
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Profile"
      onConfirm={handleSubmit}
      confirmText="Save Changes"
      showFooter={true}
    >
      {formContent}
    </Modal>
  );
}
