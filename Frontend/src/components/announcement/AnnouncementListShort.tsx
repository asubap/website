import { Announcement } from "../../types";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import SearchInput from "../common/SearchInput";
import { MoreHorizontal } from "lucide-react";

interface AnnouncementListShortProps {
  announcements: Announcement[];
  onEdit?: (announcement: Announcement) => void;
  onView?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
  onCreateNew?: () => void;
}

export const AnnouncementListShort = ({
  announcements,
  onEdit,
  onView,
  onDelete,
  onCreateNew,
}: AnnouncementListShortProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Function to format the timestamp in readable format
  const formatDateTime = (timestamp: string) => {
    if (!timestamp) return "No date";

    try {
      // Parse the ISO timestamp
      const date = parseISO(timestamp);
      // Format as "MMM d, yyyy 'at' h:mm a" (e.g., "Jan 15, 2024 at 2:30 PM")
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
  const getPlainText = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  // Filter announcements based on search query
  const filteredAnnouncements = announcements.filter((a) => {
    const searchTerm = searchQuery.toLowerCase();
    const plainDescription = a.description ? getPlainText(a.description).toLowerCase() : "";
    
    return (
      a.title.toLowerCase().includes(searchTerm) ||
      plainDescription.includes(searchTerm)
    );
  });

  return (
    <div className="w-full flex flex-col">
      {/* Search Bar and Add Button */}
      <div className="flex items-center gap-4 w-full sm:w-auto mb-2">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search announcements by title or description..."
          containerClassName="flex-grow sm:w-64"
          inputClassName="px-3 py-2"
        />
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="bg-bapred text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center justify-center whitespace-nowrap text-sm font-medium"
          >
            <span className="mr-1">+</span>
            <span className="hidden md:inline mr-1">New</span>
            Announcement
          </button>
        )}
      </div>
      <div className="h-[300px] flex flex-col py-2 gap-2 overflow-y-scroll scrollbar-thumb-bapgray scrollbar-track-bapgraylight">
        {filteredAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className={`w-full border border-bapgray rounded-md px-4 py-2 flex flex-col bg-white relative cursor-pointer ${
              announcement.is_pinned ? "border-bapred bg-red-50" : ""
            }`}
            onClick={() => onView && onView(announcement)}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center">
                <h3 className="font-semibold text-gray-800 text-m pr-2">
                  {announcement.title}
                </h3>
                {announcement.is_pinned && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-bapred"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 11V5c0-1.1.9-2 2-2h4a2 2 0 012 2v6h1a1 1 0 010 2h-1v6a2 2 0 01-2 2h-4a2 2 0 01-2-2v-6H5a1 1 0 110-2h6z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(announcement);
                    }}
                    className="text-gray-500 hover:text-bapred transition-colors"
                    aria-label="Edit announcement"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(announcement);
                    }}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    aria-label="Delete announcement"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-1">
  {getPlainText(announcement.description)}
</p>
            <p className="text-xs text-gray-500">
              {announcement.created_at
                ? formatDateTime(announcement.created_at)
                : "No date available"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
