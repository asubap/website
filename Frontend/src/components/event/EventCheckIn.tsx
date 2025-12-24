import React, { useState } from "react";
import { useAuth } from "../../context/auth/authProvider";
import { useToast } from "../../context/toast/ToastContext";

interface EventCheckInProps {
  eventId: string;
  eventAttending: string[];
  eventRSVPed: string[];
  eventDate: string;
  eventTime: string;
  eventHours: number;
  checkInWindowMinutes?: number;
  onCheckInSuccess?: () => void;
}

export const isEventInSession = (
  eventDate: string,
  eventTime: string,
  eventHours: number
) => {
  if (!eventDate || !eventTime || eventHours === undefined || eventHours === null) return false;
  const start = new Date(`${eventDate}T${eventTime}`);
  const end = new Date(start.getTime() + eventHours * 60 * 60 * 1000);
  const now = new Date();
  return now >= start && now <= end;
};

const EventCheckIn: React.FC<EventCheckInProps> = ({
  eventId,
  eventAttending = [],
  eventRSVPed = [],
  eventDate,
  eventTime,
  eventHours,
  checkInWindowMinutes = 15,
  onCheckInSuccess,
}) => {
  const [status, setStatus] = useState<
    "idle" | "locating" | "sending" | "success" | "error"
  >("idle");
  const { session } = useAuth();
  const { showToast } = useToast();

  const alreadyCheckedIn = (eventAttending || []).includes(
    session?.user?.id || ""
  );

  const inSession = isEventInSession(eventDate, eventTime, eventHours);

  const checkIn = async () => {
    console.log("inside checkin");
    if (!inSession) {
      showToast(
        "You can only check in during the event session window.",
        "error"
      );
      return;
    }
    const eventStart = new Date(`${eventDate}T${eventTime}`);
    const now = new Date();
    const checkInDeadline = new Date(
      eventStart.getTime() + checkInWindowMinutes * 60 * 1000
    );
    if (now > checkInDeadline) {
      showToast(
        `You are checking in after the allowed ${checkInWindowMinutes}-minute window.`,
        "error"
      );
      return;
    }
    console.log("before geolocation");
    if (!navigator.geolocation) {
      showToast("Geolocation not supported by your browser.", "error");
      return;
    }
    console.log("before access token");
    if (!session?.access_token) {
      setStatus("error");
      showToast("Not authenticated. Please log in again.", "error");
      return;
    }
    console.log("before already checked in");
    if (alreadyCheckedIn) {
      setStatus("error");
      showToast("Already checked in.", "error");
      return;
    }

    console.log("before rsvped");
    if (!(eventRSVPed || []).includes(session.user.id || "")) {
      setStatus("error");
      showToast("Cannot check in, not RSVP'd.", "error");
      return;
    }
    console.log("before location");
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        console.log("before location");
        const { latitude, longitude, accuracy } = pos.coords;
        console.log("latitude", latitude);
        console.log("longitude", longitude);
        console.log("accuracy", accuracy);
        if (latitude === 0 || longitude === 0 || accuracy === 0) {
          setStatus("error");
          showToast(
            "Failed to retrieve your location. Please try again.",
            "error"
          );
          return;
        }
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
            showToast(data.message, "success");
            if (onCheckInSuccess) {
              onCheckInSuccess();
            }
          } else {
            setStatus("error");
            showToast(data.error || "Check-in failed.", "error");
          }
        } catch (err) {
          console.log("error", err);
          setStatus("error");
          showToast("Network error during check-in.", "error");
        }
      },
      (err) => {
        setStatus("error");
        if (err.code === err.PERMISSION_DENIED) {
          showToast(
            "Permission denied. Please allow location access.",
            "error"
          );
        } else {
          showToast("Failed to retrieve your location.", "error");
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
          !inSession ||
          alreadyCheckedIn ||
          status === "sending" ||
          status === "locating"
            ? "bg-gray-400 cursor-not-allowed"
            : status === "success"
            ? "bg-green-600"
            : status === "error" || (status === "idle" && !alreadyCheckedIn)
            ? "bg-[#AF272F] hover:bg-[#8f1f26]"
            : "bg-[#AF272F] hover:bg-[#8f1f26]"
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AF272F]`}
        disabled={
          !inSession ||
          alreadyCheckedIn ||
          status === "sending" ||
          status === "locating"
        }
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
    </div>
  );
};

export default EventCheckIn;
