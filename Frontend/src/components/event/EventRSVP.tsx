import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth/authProvider";
import Modal from "../ui/Modal";
import { toast } from "react-hot-toast";

interface EventRSVPProps {
  eventId: string;
  eventRSVPed: string[];
  eventName: string;
  isRSVPFull: boolean;
  onRSVPChange?: () => void; // Optional callback to inform parent of RSVP change
}

const EventRSVP: React.FC<EventRSVPProps> = ({ eventId, eventRSVPed, eventName, isRSVPFull, onRSVPChange }) => {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localRSVPed, setLocalRSVPed] = useState<boolean>(false);
  const { session } = useAuth();

  // Keep localRSVPed in sync when session loads or eventRSVPed changes
  useEffect(() => {
    if (session?.user?.id) {
      setLocalRSVPed(eventRSVPed.includes(session.user.id));
    }
  }, [session?.user?.id, eventRSVPed]);

  const handleRSVPAction = async () => {
    if (!session?.access_token) {
      setStatus("error");
      toast.error("Not authenticated. Please log in again.");
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
        toast.success(data.message);
        onRSVPChange?.();
      } else {
        setStatus("error");
        toast.error(data.error || `${localRSVPed ? "Un-RSVP" : "RSVP"} failed.`);
      }
    } catch (err) {
      console.error("RSVP error:", err);
      setStatus("error");
      toast.error("Network error during RSVP.");
    }
    setShowConfirmModal(false);
  };

  return (
    <div>
      <button
        onClick={() => setShowConfirmModal(true)}
          className={`w-full sm:w-40 px-4 py-2 rounded-md text-sm font-medium ${
            status === "sending"
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
            : status === "error"
            ? "bg-red-600 text-white"
            : isRSVPFull && !localRSVPed
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"  // Gray out only if full and not RSVPed
            : "bg-[#AF272F] text-white hover:bg-[#8f1f26]"  // Normal red for RSVP/Un-RSVP
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AF272F]`}
        disabled={status === "sending" || (isRSVPFull && !localRSVPed)}  // Allow un-RSVP if already RSVPed
      >
        {localRSVPed ? "Un-RSVP" : "RSVP"}
      </button>
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
