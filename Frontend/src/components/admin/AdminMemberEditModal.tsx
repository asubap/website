import { useState, useEffect } from "react";
import { useToast } from "../../context/toast/ToastContext";
import { supabase } from "../../context/auth/supabaseClient";
import ProfileEditModal from "../member/ProfileEditModal";

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
  rank: string;
  role?: string; // Add role field for admin editing
};

interface AdminMemberEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData | null;
  onSave: (formData: ProfileData) => void;
  isLoading?: boolean;
}

export default function AdminMemberEditModal({
  isOpen,
  onClose,
  profileData,
  onSave,
  isLoading = false,
}: AdminMemberEditModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<ProfileData | null>(profileData);

  // Sync formData with profileData when profileData changes
  useEffect(() => {
    setFormData(profileData);
  }, [profileData]);

  if (!isOpen) return null;

  if (isLoading || !profileData || !formData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-bapred mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading member details...</div>
        </div>
      </div>
    );
  }

  const handleSave = async (updatedData: ProfileData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast("Authentication error. Please log in again.", "error");
        return;
      }

      const token = session.access_token;

      // Update member info
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/member-info/edit-member-info/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_email: updatedData.email,
          about: updatedData.about,
          name: updatedData.name,
          graduating_year: updatedData.graduationDate,
          major: updatedData.major,
          phone: updatedData.phone,
          member_status: updatedData.status,
          member_rank: updatedData.rank,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update member info");
      }

      // If role is changed, update user role
      if (updatedData.role && updatedData.role !== profileData.role) {
        const roleResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/update-role`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_email: updatedData.email,
            role: updatedData.role,
          }),
        });

        if (!roleResponse.ok) {
          const errorData = await roleResponse.json();
          throw new Error(errorData.message || "Failed to update user role");
        }
      }

      showToast("Member information updated successfully", "success");
      onSave(updatedData);
      onClose();
    } catch (error) {
      console.error("Error updating member:", error);
      showToast(error instanceof Error ? error.message : "Failed to update member", "error");
    }
  };

  return (
    <ProfileEditModal
      isOpen={isOpen}
      onClose={onClose}
      profileData={formData}
      onSave={handleSave}
      showRank={true}
    />
  );
} 