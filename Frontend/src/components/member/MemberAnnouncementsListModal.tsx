import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Announcement } from "../../types";
import { AnnouncementListShort } from "../announcement/AnnouncementListShort";
import ViewAnnouncementModal from "../admin/ViewAnnouncementModal";
import LoadingSpinner from "../common/LoadingSpinner";
import { useScrollLock } from "../../hooks/useScrollLock";

interface MemberAnnouncementsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcementsData: Announcement[];
}

const MemberAnnouncementsListModal = ({
  isOpen,
  onClose,
  announcementsData,
}: MemberAnnouncementsListModalProps) => {
  useScrollLock(isOpen);
  const [sortedAnnouncements, setSortedAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showViewDetailModal, setShowViewDetailModal] = useState(false);

  useEffect(() => {
    if (isOpen && announcementsData) {
      const newSortedAnnouncements = [...announcementsData].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;

        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      setSortedAnnouncements(newSortedAnnouncements);
    } else if (!isOpen) {
      setSortedAnnouncements([]);
    }
  }, [isOpen, announcementsData]);

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewDetailModal(true);
  };

  if (!isOpen) return null;

  const isLoading = isOpen && announcementsData.length === 0 && sortedAnnouncements.length === 0;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-6 pt-12 shadow-xl max-w-2xl w-full m-auto relative max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-xl font-semibold text-bapred mb-5 text-center">
            Announcements
          </h2>

          <div className="flex-grow overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <LoadingSpinner text="Loading announcements..." />
              </div>
            ) : sortedAnnouncements.length > 0 ? (
              <AnnouncementListShort
                announcements={sortedAnnouncements}
                onView={handleViewAnnouncement}
              />
            ) : (
              <p className="text-gray-500 text-center py-4">No announcements available.</p>
            )}
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {selectedAnnouncement && (
        <ViewAnnouncementModal
          isOpen={showViewDetailModal}
          onClose={() => {
            setShowViewDetailModal(false);
            setSelectedAnnouncement(null);
          }}
          announcement={selectedAnnouncement}
        />
      )}
    </>,
    document.body
  );
};

export default MemberAnnouncementsListModal;
