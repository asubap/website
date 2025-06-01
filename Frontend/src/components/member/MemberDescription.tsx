import React, { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { supabase } from "../../context/auth/supabaseClient";
import { MemberDetail, Announcement } from "../../types";
import { useAuth } from "../../context/auth/authProvider";
import ProfileEditModal from "./ProfileEditModal";
import EventMember from "./EventMember";
import MemberAnnouncementsListModal from "./MemberAnnouncementsListModal";
import { FaSlack } from "react-icons/fa";

interface MemberDescriptionProps {
  profileUrl: string;
  name: string;
  major: string;
  email: string;
  phone: string;
  status: string;
  hours: string;
  year: string;
  internship: string;
  description: string;
  rank: string;
  developmentHours: string;
  professionalHours: string;
  serviceHours: string;
  socialHours: string;
  id?: string;
  role?: string;
}

const READ_ANNOUNCEMENTS_KEY = "readAnnouncementIds";

const getReadAnnouncementIdsFromStorage = (): string[] => {
  const stored = localStorage.getItem(READ_ANNOUNCEMENTS_KEY);
  try {
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error parsing read announcements from localStorage", e);
    return [];
  }
};

const addAnnouncementsToReadStorage = (idsToAdd: string[]) => {
  const currentReadIds = new Set(getReadAnnouncementIdsFromStorage());
  idsToAdd.forEach((id) => currentReadIds.add(id));
  localStorage.setItem(
    READ_ANNOUNCEMENTS_KEY,
    JSON.stringify(Array.from(currentReadIds))
  );
};

const MemberDescription: React.FC<MemberDescriptionProps> = ({
  profileUrl,
  name,
  major,
  description,
  email,
  phone,
  status,
  hours,
  year,
  internship,
  rank,
  developmentHours,
  professionalHours,
  serviceHours,
  socialHours,
  id,
  role,
}) => {
  const { session } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnnouncementsListModalOpen, setIsAnnouncementsListModalOpen] =
    useState(false);
  const [announcementBadgeCount, setAnnouncementBadgeCount] = useState(0);
  const [allFetchedAnnouncementIds, setAllFetchedAnnouncementIds] = useState<
    string[]
  >([]);
  const [allAnnouncementsData, setAllAnnouncementsData] = useState<
    Announcement[]
  >([]);

  const calculateUnreadCount = useCallback(() => {
    const readIds = new Set(getReadAnnouncementIdsFromStorage());
    const unreadCount = allFetchedAnnouncementIds.filter(
      (id) => !readIds.has(id)
    ).length;
    setAnnouncementBadgeCount(unreadCount);
  }, [allFetchedAnnouncementIds]);

  useEffect(() => {
    const fetchAnnouncementsForBadgeAndModal = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          console.error("User not authenticated. Cannot fetch announcements.");
          return;
        }
        const token = session.access_token;
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/announcements`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch announcements");
          return;
        }
        const data: Announcement[] = await response.json();
        if (Array.isArray(data)) {
          setAllAnnouncementsData(data);
          const ids = data
            .map((ann) => ann.id)
            .filter((id) => id != null && id !== undefined);
          setAllFetchedAnnouncementIds(ids);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncementsForBadgeAndModal();
  }, []);

  useEffect(() => {
    calculateUnreadCount();
  }, [allFetchedAnnouncementIds, calculateUnreadCount]);

  const handleOpenAnnouncementsModal = () => {
    if (allFetchedAnnouncementIds.length > 0) {
      addAnnouncementsToReadStorage(allFetchedAnnouncementIds);
    }
    calculateUnreadCount();
    setIsAnnouncementsListModalOpen(true);
  };

  const [profileData, setProfileData] = useState<MemberDetail>(() => {
    const userId = id || session?.user?.id || email;
    const userRole =
      role || session?.user?.user_metadata?.role || "general-member";
    return {
      id: userId,
      name: name,
      email: email,
      phone: phone,
      major: major,
      graduationDate: year,
      status: status,
      about: description,
      internship: internship,
      photoUrl: profileUrl,
      hours: hours,
      rank: rank,
      role: userRole,
      developmentHours: developmentHours,
      professionalHours: professionalHours,
      serviceHours: serviceHours,
      socialHours: socialHours,
      type: "member",
      links: [],
    };
  });

  const handleSaveProfile = (newData: MemberDetail): void => {
    setProfileData(newData);
  };

  return (
    <main className="flex flex-col lg:flex-row flex-1 py-4 px-8 sm:py-8 sm:px-16 gap-12 lg:gap-20 mt-[150px]">
      <div className="w-full lg:w-1/2 relative">
        <button
          onClick={handleOpenAnnouncementsModal}
          className="absolute top-16 sm:top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10 flex items-center justify-center w-10 h-10"
          aria-label="View Announcements"
          title="View Announcements"
        >
          <Bell size={50} className="text-[#af272f]" strokeWidth={2.5} />
          {announcementBadgeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#af272f] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
              {announcementBadgeCount > 9 ? "9+" : announcementBadgeCount}
            </span>
          )}
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          Welcome back, {name}!
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 bg-[#d9d9d9] rounded-full flex-shrink-0 mx-auto sm:mx-0 overflow-hidden">
            {profileUrl ? (
              <img
                src={profileData.photoUrl}
                alt="Profile"
                width={144}
                height={144}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">
              {profileData.name}
            </h3>
            <p className="text-[#202020]">{profileData.major}</p>
            <p className="text-[#555555]">{profileData.email}</p>
            <p className="text-[#555555]">{profileData.phone}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6">
          <div>
            <span className="font-bold">Graduating:</span>{" "}
            {profileData.graduationDate}
          </div>
          <div>
            <span className="font-bold">Status:</span> {profileData.status}
          </div>
          <div>
            <span className="font-bold">Hours:</span> {profileData.hours}
          </div>
          <div>
            <span className="font-bold">Rank:</span>{" "}
            {profileData.rank
              ? profileData.rank.charAt(0).toUpperCase() +
                profileData.rank.slice(1)
              : "Not set"}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 mb-6">
          <div>
            <span className="font-semibold">Social Hours:</span>{" "}
            {profileData.socialHours}
          </div>
          <div>
            <span className="font-semibold">Professional Hours:</span>{" "}
            {profileData.professionalHours}
          </div>
          <div>
            <span className="font-semibold">Service Hours:</span>{" "}
            {profileData.serviceHours}
          </div>
          <div>
            <span className="font-semibold">Development Hours:</span>{" "}
            {profileData.developmentHours ?? "0"}
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-bold mb-2">About</h4>
          <p className="text-[#202020]">{profileData.about}</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 lg:mb-0 gap-4">
          <button
            className="bg-[#af272f] text-white px-6 py-3 rounded-md hover:bg-[#8f1f26] transition-colors flex items-center gap-2"
            onClick={() => window.open("https://your-slack-link.com", "_blank")}
          >
            <FaSlack className="w-4 h-4" />
            Go to Slack
          </button>
          <button
            className="bg-[#af272f] text-white px-6 py-3 rounded-md hover:bg-[#8f1f26] transition-colors"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </button>
        </div>
      </div>

      <EventMember />

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profileData}
        onSave={handleSaveProfile}
      />
      {isAnnouncementsListModalOpen && (
        <MemberAnnouncementsListModal
          announcementsData={allAnnouncementsData}
          isOpen={isAnnouncementsListModalOpen}
          onClose={() => {
            setIsAnnouncementsListModalOpen(false);
          }}
        />
      )}
    </main>
  );
};

export default MemberDescription;
