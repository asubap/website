import { useState } from "react";
import { useAuth } from "../../context/auth/authProvider";

interface EventRSVPProps {
  eventId: string;
}

const EventRSVP: React.FC<EventRSVPProps> = ({ eventId }) => {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const { session } = useAuth();

  const rsvp = async () => {
    if (!session?.access_token) {
      setStatus("error");
      setMessage("Not authenticated. Please log in again.");
      return;
    }

    try {
      setStatus("sending");
      const res = await fetch(`https://asubap-backend.vercel.app/events/rsvp/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.error || "RSVP failed.");
      }
    } catch (err) {
      console.error("RSVP error:", err);
      setStatus("error");
      setMessage("Network error during RSVP.");
    }
  };

  return (
    <div>
      <button
        onClick={rsvp}
        className={`px-4 py-2 text-white rounded-lg w-full text-sm ${
          status === "sending"
            ? "bg-gray-400"
            : status === "success"
            ? "bg-green-600"
            : status === "error"
            ? "bg-red-600"
            : "bg-[#AF272F] hover:bg-[#8f1f26]"
        }`}
        disabled={status === "sending"}
      >
        {status === "sending"
          ? "Submitting..."
          : status === "success"
          ? "✓ RSVP'd"
          : status === "error"
          ? "Try Again"
          : "RSVP"}
      </button>
      {message && (
        <p className={`mt-1 text-xs ${
          status === "success" ? "text-green-600" : "text-red-600"
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default EventRSVP; 
