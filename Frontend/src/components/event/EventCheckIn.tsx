import { useState } from "react";
import { useAuth } from "../../context/auth/authProvider";

interface EventCheckInProps {
  eventId: string;
}

const EventCheckIn: React.FC<EventCheckInProps> = ({ eventId }) => {
  const [status, setStatus] = useState<"idle" | "locating" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const { session } = useAuth();

  const checkIn = async () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported by your browser.");
      return;
    }

    if (!session?.access_token) {
      setStatus("error");
      setMessage("Not authenticated. Please log in again.");
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        try {
          setStatus("sending");
          console.log("Sending check-in request with token:", session.access_token);

          const res = await fetch(`https://asubap-backend.vercel.app/events/checkin/${eventId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`
            },
            credentials: "include",
            body: JSON.stringify({ latitude, longitude, accuracy }),
          });

          const data = await res.json();
          console.log("Check-in response:", data);

          if (res.ok) {
            setStatus("success");
            setMessage(data.message);
          } else {
            setStatus("error");
            setMessage(data.error || "Check-in failed.");
          }
        } catch (err) {
          console.error("Check-in error:", err);
          setStatus("error");
          setMessage("Network error during check-in.");
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
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
        className={`px-4 py-2 text-white rounded-lg w-full text-sm ${
          status === "sending" || status === "locating"
            ? "bg-gray-400"
            : status === "success"
            ? "bg-green-600"
            : status === "error"
            ? "bg-red-600"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        disabled={status === "sending" || status === "locating"}
      >
        {status === "locating"
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
        <p className={`mt-1 text-xs ${
          status === "success" ? "text-green-600" : "text-red-600"
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default EventCheckIn;
