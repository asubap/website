import { useState } from "react";
import { useAuth } from "../../context/auth/authProvider";
import Modal from "../ui/Modal";

interface EventRSVPProps {
  eventId: string;
  eventRSVPed: string[];
  eventName: string;
}

const EventRSVP: React.FC<EventRSVPProps> = ({ eventId, eventRSVPed, eventName }) => {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localRSVPed, setLocalRSVPed] = useState<boolean>(eventRSVPed.includes(useAuth().session?.user?.id || ""));
  const { session } = useAuth();

  // Keep localRSVPed in sync if eventRSVPed changes (e.g. after parent refresh)
  // (Optional: can add useEffect if you want to sync with parent updates)

  const handleRSVPAction = async () => {
    if (!session?.access_token) {
      setStatus("error");
      setMessage("Not authenticated. Please log in again.");
      setShowConfirmModal(false);
      return;
    }

    try {
      setStatus("sending");
      const endpoint = localRSVPed
        ? `${import.meta.env.VITE_BACKEND_URL}/events/unrsvp/${eventId}`
        : `${import.meta.env.VITE_BACKEND_URL}/events/rsvp/${eventId}`;
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("idle");
        setLocalRSVPed(!localRSVPed);
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.error || `${localRSVPed ? "Un-RSVP" : "RSVP"} failed.`);
      }
    } catch (err) {
      console.error("RSVP error:", err);
      setStatus("error");
      setMessage("Network error during RSVP.");
    }
    setShowConfirmModal(false);
  };

  return (
    <div>
      <button
        onClick={() => setShowConfirmModal(true)}
        className={`w-40 px-4 py-2 text-white rounded-md text-sm font-medium ${
          status === "sending"
            ? "bg-gray-400"
            : status === "error"
            ? "bg-red-600"
            : localRSVPed
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-[#AF272F] hover:bg-[#8f1f26]"
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AF272F]`}
        disabled={status === "sending"}
      >
        {localRSVPed ? "Un-RSVP" : "RSVP"}
      </button>
      {message && (
        <p
          className={`mt-1 text-xs ${
            status === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={`Confirm ${localRSVPed ? "Un-RSVP" : "RSVP"}`}
        onConfirm={handleRSVPAction}
        confirmText={localRSVPed ? "Un-RSVP" : "RSVP"}
        cancelText="Cancel"
      >
        <p className="text-gray-600">
          Are you sure you want to {localRSVPed ? "un-RSVP" : "RSVP"} to the event "{eventName}"?
        </p>
      </Modal>
    </div>
  );
};

export default EventRSVP;
