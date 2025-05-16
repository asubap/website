import { useState } from "react";
import { useAuth } from "../../context/auth/authProvider";
import Modal from "../ui/Modal";
import { toast } from "react-hot-toast";

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
  const [showNotInSessionModal, setShowNotInSessionModal] = useState(false);
  const { session } = useAuth();

  const alreadyCheckedIn = (eventAttending || []).includes(session?.user?.id || "");

  // Helper: is the event currently in session?
  const isEventInSession = () => {
    if (!eventDate || !eventTime || !eventHours) return false;
    const start = new Date(`${eventDate}T${eventTime}`);
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
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    if (!session?.access_token) {
      setStatus("error");
      toast.error("Not authenticated. Please log in again.");
      return;
    }
    if (alreadyCheckedIn) {
      setStatus("error");
      toast.error("Already checked in.");
      return;
    }
    if (!(eventRSVPed || []).includes(session.user.id)) {
      setStatus("error");
      toast.error("Cannot check in, not RSVP'd.");
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
            toast.success(data.message);
          } else {
            setStatus("error");
            toast.error(data.error || "Check-in failed.");
          }
        } catch (err) {
          setStatus("error");
          toast.error("Network error during check-in.");
        }
      },
      (err) => {
        setStatus("error");
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Permission denied. Please allow location access.");
        } else {
          toast.error("Failed to retrieve your location.");
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
        className={`w-full sm:w-40 px-4 py-2 text-white rounded-md text-sm font-medium ${
          !inSession || alreadyCheckedIn || status === "sending" || status === "locating"
            ? "bg-gray-400 cursor-not-allowed"
            : status === "success"
            ? "bg-green-600"
            : (status === "error" || (status === "idle" && !alreadyCheckedIn))
            ? "bg-[#AF272F] hover:bg-[#8f1f26]"
            : "bg-[#AF272F] hover:bg-[#8f1f26]"
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AF272F]`}
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
