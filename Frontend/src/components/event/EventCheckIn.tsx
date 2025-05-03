import { useState } from "react";
import { useAuth } from "../../context/auth/authProvider";
import Modal from "../ui/Modal";

interface EventCheckInProps {
  eventId: string;
  eventAttending: string[];
  eventRSVPed: string[];
  eventDate: string;
  eventTime: string;
  eventHours: number;
}

const EventCheckIn: React.FC<EventCheckInProps> = ({
  eventId,
  eventAttending = [],
  eventRSVPed = [],
  eventDate,
  eventTime,
  eventHours,
}) => {
  const [status, setStatus] = useState<
    "idle" | "locating" | "sending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [showNotInSessionModal, setShowNotInSessionModal] = useState(false);
  const { session } = useAuth();

  const alreadyCheckedIn = (eventAttending || []).includes(session?.user?.id || "");

  // Helper: is the event currently in session?
  const isEventInSession = () => {
    if (!eventDate || !eventTime || !eventHours) return false;
    const [hour, minute] = eventTime.split(":").map(Number);
    const start = new Date(eventDate);
    start.setHours(hour, minute, 0, 0);
    const end = new Date(start.getTime() + eventHours * 60 * 60 * 1000);
    const now = new Date();
    return now >= start && now <= end;
  };

  const inSession = isEventInSession();

  const checkIn = async () => {
    if (!inSession) {
      setShowNotInSessionModal(true);
      return;
    }
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported by your browser.");
      return;
    }
    if (!session?.access_token) {
      setStatus("error");
      setMessage("Not authenticated. Please log in again.");
      return;
    }
    if (alreadyCheckedIn) {
      setStatus("error");
      setMessage("Already checked in.");
      return;
    }
    if (!(eventRSVPed || []).includes(session.user.id)) {
      setStatus("error");
      setMessage("Cannot check in, not RSVP'd.");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        try {
          setStatus("sending");
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/events/checkin/${eventId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              credentials: "include",
              body: JSON.stringify({ latitude, longitude, accuracy }),
            }
          );
          const data = await res.json();
          if (res.ok) {
            setStatus("success");
            setMessage(data.message);
          } else {
            setStatus("error");
            setMessage(data.error || "Check-in failed.");
          }
        } catch (err) {
          setStatus("error");
          setMessage("Network error during check-in.");
        }
      },
      (err) => {
        setStatus("error");
        if (err.code === err.PERMISSION_DENIED) {
          setMessage("Permission denied. Please allow location access.");
        } else {
          setMessage("Failed to retrieve your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div>
      <button
        onClick={checkIn}
        className={`w-40 px-4 py-2 text-white rounded-md text-sm font-medium ${
          !inSession || alreadyCheckedIn || status === "sending" || status === "locating"
            ? "bg-gray-400 cursor-not-allowed"
            : status === "success"
            ? "bg-green-600"
            : status === "error"
            ? "bg-red-600"
            : "bg-blue-600 hover:bg-blue-700"
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600`}
        disabled={!inSession || alreadyCheckedIn || status === "sending" || status === "locating"}
      >
        {alreadyCheckedIn
          ? "Checked In"
          : status === "locating"
          ? "Getting Location..."
          : status === "sending"
          ? "Checking in..."
          : status === "success"
          ? "✓ Checked In"
          : status === "error"
          ? "Try Again"
          : "Check In"}
      </button>
      {message && (
        <p
          className={`mt-1 text-xs ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
      <Modal
        isOpen={showNotInSessionModal}
        onClose={() => setShowNotInSessionModal(false)}
        title="Event not in session"
        confirmText="OK"
        onConfirm={() => setShowNotInSessionModal(false)}
      >
        <p className="text-gray-600">You can only check in during the event session window.</p>
      </Modal>
    </div>
  );
};

export default EventCheckIn;
