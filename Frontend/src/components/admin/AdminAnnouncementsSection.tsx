import React from "react";
import { Announcement } from "../../types";
import LoadingSpinner from "../common/LoadingSpinner";
import { AnnouncementListShort } from "../announcement/AnnouncementListShort";

interface AdminAnnouncementsSectionProps {
  announcements: Announcement[];
  loadingAnnouncements: boolean;
  onCreateAnnouncement: () => void;
  onEditAnnouncement: (announcement: Announcement) => void;
  onViewAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (announcement: Announcement) => void;
}

const AdminAnnouncementsSection: React.FC<AdminAnnouncementsSectionProps> = ({
  announcements,
  loadingAnnouncements,
  onCreateAnnouncement,
  onEditAnnouncement,
  onViewAnnouncement,
  onDeleteAnnouncement,
}) => (
  <div>
    <div className="flex items-center mb-2">
      <h2 className="text-2xl font-semibold">Announcements</h2>
      <button
        className="ml-auto px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors"
        onClick={onCreateAnnouncement}
      >
        + <span className="hidden md:inline">New </span>Announcement
      </button>
    </div>
    <div className="max-h-72 overflow-y-auto pr-2">
      {loadingAnnouncements ? (
        <LoadingSpinner text="Loading announcements..." size="md" />
      ) : announcements.length > 0 ? (
        <AnnouncementListShort
          announcements={announcements}
          onEdit={onEditAnnouncement}
          onView={onViewAnnouncement}
          onDelete={onDeleteAnnouncement}
        />
      ) : (
        <p className="text-gray-500 text-sm">No announcements available.</p>
      )}
    </div>
  </div>
);

export default AdminAnnouncementsSection;
