import type React from "react";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../context/auth/authProvider";
import Modal from "../../components/ui/Modal";

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
};

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onSave: (data: ProfileData) => void;
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
  const { session } = useAuth();

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
    try {
      const token = session?.access_token;
      const formData = new FormData();
      formData.append("file", file);
      // Get the user's ID from the session or fetch it if needed
      // Use the actual user ID instead of email
      const response = await fetch(`${BACKEND_URL}/member-info/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_email: profileData.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const userData = await response.json();
      const userId = userData[0]?.user_id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Now use the actual user ID for uploading the photo
      const formDataWithId = new FormData();
      formDataWithId.append("file", file);
      formDataWithId.append("userId", userId);

      const uploadResponse = await fetch(
        `${BACKEND_URL}/profile-photo/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataWithId,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload photo");
      }

      const data = await uploadResponse.json();
      setPhotoPreview(data.photoUrl);
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  const handlePhotoDelete = async () => {
    try {
      const token = session?.access_token;

      // Get the user's ID from the session or fetch it
      const response = await fetch(`${BACKEND_URL}/member-info/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_email: profileData.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const userData = await response.json();
      const userId = userData[0]?.user_id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const deleteResponse = await fetch(
        `${BACKEND_URL}/profile-photo/${userId}`,
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
    }
  };

  const handleSubmit = async () => {
    onSave(formData);
    // Send the updated data to the server

    fetch(`${BACKEND_URL}/member-info/edit-member-info/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        user_email: formData.email,
        about: formData.about, // leave this empty ("") if not being changed
        internship_experience: formData.internship, // leave this empty ("") if not being changed
        first_name: formData.name, // leave this empty ("") if not being changed
        last_name: "", // leave this empty ("") if not being changed
        year: formData.graduationDate, // leave this empty ("") if not being changed
        major: formData.major, // leave this empty ("") if not being changed
        contact_me: formData.phone, // leave this empty ("") if not being changed
        graduation_year: "",
        member_status: formData.status, // leave this empty ("") if not being changed
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.error("Error editing:", error));

    onClose();
  };

  const formContent = (
    <div className="flex flex-col overflow-y-auto max-h-[75vh] p-1"> {/* Added overflow-y-auto, max-h, and slight padding for scrollbar */}
      {/* Center - Photo Upload - Moved to top */}
      <div className="w-full flex justify-center items-center p-6 pt-4 md:pt-6">
        <div className="relative">
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
            <label className="px-4 py-2 bg-[#af272f] text-white rounded-full hover:bg-[#8f1f26] transition-colors cursor-pointer text-center text-sm">
              Upload Profile Photo
              <input
                accept="image/*"
                className="hidden"
                aria-label="Upload profile photo"
                type="file"
                onChange={handlePhotoUpload}
              />
            </label>
            {photoPreview && (
              <button
                onClick={handlePhotoDelete}
                className="px-4 py-2 border border-[#d9d9d9] rounded-full text-[#202020] hover:bg-gray-100 transition-colors text-sm"
              >
                Delete Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Left Column - Edit Form - Now takes full width below photo */}
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

            {/* Name Input */}
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
              {/* Email Input */}
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
              {/* Phone Input */}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Major Input */}
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
              {/* Graduation Date Input */}
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
              {/* Status Select */}
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
            </div>

            {/* About Textarea */}
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
