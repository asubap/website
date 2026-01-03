import { Calendar, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/auth/authProvider";

const CalendarSubscribeButton = () => {
  const { isAuthenticated, role } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if user should see the calendar subscribe button
  const shouldShowButton = () => {
    if (!isAuthenticated) return false;

    // Block sponsors and alumni
    if (typeof role === "string") {
      const lowerRole = role.toLowerCase();
      if (lowerRole.includes("sponsor") || lowerRole.includes("alumni")) {
        return false;
      }
    } else if (typeof role === "object" && role !== null && role.type === "sponsor") {
      return false;
    }

    // Allow: e-board, general-member, or anyone else who is authenticated and not blocked above
    return true;
  };

  // Don't render if user shouldn't see it
  if (!shouldShowButton()) {
    return null;
  }

  const baseUrl = import.meta.env.VITE_BACKEND_URL || "";
  const icsUrl = `${baseUrl}/events/calendar.ics`;
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(icsUrl)}`;

  const handleGoogleCalendar = () => {
    window.open(googleCalendarUrl, "_blank");
  };

  const handleOtherApps = () => {
    setShowModal(true);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(icsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <>
      <div className="relative inline-flex items-center gap-2">
        <button
          onClick={handleGoogleCalendar}
          className="inline-flex items-center gap-2 px-4 py-2 bg-bapred text-white text-sm font-medium rounded-md hover:bg-bapreddark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bapred"
        >
          <Calendar size={18} />
          <span className="hidden sm:inline">Add to Google Calendar</span>
          <span className="sm:hidden">Google Calendar</span>
        </button>

        <button
          onClick={handleOtherApps}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bapred"
        >
          <Calendar size={18} />
          <span className="hidden sm:inline">Other Calendar Apps</span>
          <span className="sm:hidden">Other Apps</span>
        </button>
      </div>

      {/* Modal for Other Calendar Apps */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-bapred" size={24} />
              <h2 className="text-xl font-semibold">Subscribe to Events Calendar</h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Copy the URL below and paste it into your calendar app to subscribe to all BAP events:
            </p>

            {/* URL Display with Copy Button */}
            <div className="bg-gray-50 border border-gray-300 rounded-md p-3 mb-4">
              <div className="flex items-center gap-2">
                <code className="text-xs text-gray-800 flex-1 break-all">{icsUrl}</code>
                <button
                  onClick={handleCopyUrl}
                  className="flex-shrink-0 p-2 text-gray-600 hover:text-bapred transition-colors"
                  title="Copy URL"
                >
                  {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 mb-6">
              <div>
                <h3 className="font-semibold text-sm mb-1">Apple Calendar:</h3>
                <p className="text-xs text-gray-600">
                  File → New Calendar Subscription → Paste URL → Subscribe
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Outlook:</h3>
                <p className="text-xs text-gray-600">
                  Calendar → Add Calendar → From Internet → Paste URL → OK
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Other Apps:</h3>
                <p className="text-xs text-gray-600">
                  Look for "Subscribe to Calendar" or "Add Calendar from URL" option
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-bapred text-white text-sm font-medium rounded-md hover:bg-bapreddark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarSubscribeButton;
