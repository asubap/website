import { Announcement } from "../../types";
import { format } from "date-fns";

interface AnnouncementListShortProps {
  announcements: Announcement[];
  onEdit?: (announcement: Announcement) => void;
  onView?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
}

export const AnnouncementListShort = ({ announcements, onEdit, onView, onDelete }: AnnouncementListShortProps) => {
  return (
    <div className="space-y-3 mt-2">
      {[...announcements].reverse().map((announcement) => (
        <div 
          key={announcement.id} 
          className={`p-3 rounded-md border ${announcement.is_pinned ? 'border-bapred bg-red-50' : 'border-gray-200'} relative`}
        >
          {announcement.is_pinned && (
            <div className="absolute top-2 right-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-bapred" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V5c0-1.1.9-2 2-2h4a2 2 0 012 2v6h1a1 1 0 010 2h-1v6a2 2 0 01-2 2h-4a2 2 0 01-2-2v-6H5a1 1 0 110-2h6z" />
              </svg>
            </div>
          )}
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-gray-800 pr-6">{announcement.title}</h3>
            <div className="flex items-center space-x-2">
              {onView && (
                <button 
                  onClick={() => onView(announcement)}
                  className="text-gray-500 hover:text-bapred transition-colors"
                  aria-label="View announcement"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              )}
              {onEdit && (
                <button 
                  onClick={() => onEdit(announcement)}
                  className="text-gray-500 hover:text-bapred transition-colors"
                  aria-label="Edit announcement"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(announcement)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  aria-label="Delete announcement"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-1">{announcement.description}</p>
          <p className="text-xs text-gray-500">
            {announcement.date ? format(new Date(announcement.date), 'MMMM d, yyyy') : 'No date'}
          </p>
        </div>
      ))}
    </div>
  );
};
