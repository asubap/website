import { createPortal } from "react-dom";
import { Announcement } from "../../types";
import { format } from "date-fns";
import { useScrollLock } from "../../hooks/useScrollLock";

interface ViewAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement;
}

const ViewAnnouncementModal = ({
  isOpen,
  onClose,
  announcement,
}: ViewAnnouncementModalProps) => {
  useScrollLock(isOpen);

  if (!isOpen || !announcement) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 pt-12 shadow-xl max-w-2xl w-full m-auto relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-6">
          <div className="flex items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-800">
              {announcement.title}
            </h2>
            {announcement.is_pinned && (
              <div className="ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-bapred" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V5c0-1.1.9-2 2-2h4a2 2 0 012 2v6h1a1 1 0 010 2h-1v6a2 2 0 01-2 2h-4a2 2 0 01-2-2v-6H5a1 1 0 110-2h6z" />
                </svg>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {announcement.date
              ? format(new Date(announcement.date), 'MMMM d, yyyy')
              : 'No date'}
          </p>
          <div className="border-t border-gray-200 pt-4 mt-2">
            <p className="text-gray-700 whitespace-pre-wrap">
              {announcement.description}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ViewAnnouncementModal;
