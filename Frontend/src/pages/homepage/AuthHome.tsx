import { useAuth } from "../../context/auth/authProvider";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { supabase } from "../../context/auth/supabaseClient"; // Import supabase client
import { useToast } from "../../context/toast/ToastContext";
type AuthorizationStatus = "loading" | "authorized" | "unauthorized";

export default function AuthHome() {
  const { role, loading, setSession } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast(); // Get showToast

  // Combined state to track overall status
  const [authorizationStatus, setAuthorizationStatus] =
    useState<AuthorizationStatus>("loading");
  const [countdown, setCountdown] = useState<number>(10); // State for countdown timer

  // Function to handle manual logout and redirect
  const handleManualLogoutAndRedirect = async () => {
    console.log("Executing manual logout and redirect...");
    // Clear any existing timers just in case
    // (Though navigating away usually unmounts and cleans up)
    // No need to explicitly clear interval/timeout here as unmount will handle it.
    try {
      await supabase.auth.signOut();
      setSession(null); // Clear session immediately
      navigate("/", { replace: true }); // Redirect to home
    } catch (error) {
      console.error("Error during manual sign out:", error);
      showToast("Error during sign out.", "error");
      // Still try to navigate home
      navigate("/", { replace: true });
    }
  };

  // Effect for redirection or showing unauthorized message
  useEffect(() => {
    // Wait until authentication loading is complete
    if (loading) {
      console.log("Auth loading...");
      setAuthorizationStatus("loading");
      return;
    }

    console.log("Auth loaded. Current role:", role);

    // If authentication is done, check the role
    if (role === "e-board") {
      console.log("Redirecting to admin page...");
      setAuthorizationStatus("authorized");
      navigate("/admin", { replace: true });
    } else if (role === "sponsor") {
      console.log("Redirecting to sponsor page...");
      setAuthorizationStatus("authorized");
      navigate("/sponsor", { replace: true });
    } else if (role === "general-member") {
      console.log("Redirecting to member page...");
      setAuthorizationStatus("authorized");
      navigate("/member", { replace: true });
    } else {
      // Role is null, undefined, or invalid after loading
      console.log("Invalid or missing role:", role);
      setAuthorizationStatus("unauthorized");
      setCountdown(10); // Reset countdown when becoming unauthorized
    }
  }, [role, loading, navigate]);

  // Effect for handling the unauthorized state (logout, redirect, and countdown)
  useEffect(() => {
    if (authorizationStatus !== "unauthorized") {
      return; // Only run this effect when unauthorized
    }

    console.log("Starting countdown timer...");

    // Start interval to decrement countdown
    const intervalId = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    // Set timeout for the final action (logout/redirect)
    const timeoutId = setTimeout(async () => {
      console.log("Executing logout and redirect...");
      clearInterval(intervalId); // Stop the interval
      try {
        await supabase.auth.signOut();
        setSession(null); // Clear session in context immediately
        navigate("/", { replace: true }); // Redirect to home
      } catch (error) {
        console.error("Error during automatic sign out:", error);
        showToast("Error during automatic sign out.", "error");
        // Still try to navigate home even if sign out fails
        navigate("/", { replace: true });
      }
    }, countdown * 1000); // Use the initial countdown value for the total delay

    // Cleanup function to clear the interval and timeout
    return () => {
      console.log("Clearing countdown interval and timeout.");
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorizationStatus, navigate, setSession, showToast]); // countdown dependency intentionally omitted to prevent timeout reset on each tick

  // Render based on authorization status
  if (authorizationStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <LoadingSpinner text="Verifying your access..." size="md" />
      </div>
    );
  }

  if (authorizationStatus === "unauthorized") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-2xl font-semibold mb-4 text-red-600">
          Access Denied
        </h2>
        <p className="text-lg mb-2">
          You do not have a valid account role associated with this email.
        </p>
        <p className="text-md mb-6 text-gray-600">
          If you believe this is an error, please contact your chapter's
          administrator.
        </p>
        <p className="text-sm text-gray-500">
          You will be automatically signed out and redirected to the homepage in{" "}
          {Math.max(0, countdown)} seconds...
        </p>
        <button
          onClick={handleManualLogoutAndRedirect}
          className="mt-4 px-4 py-2 bg-bapred text-white rounded hover:bg-opacity-90"
        >
          Go to Homepage Now
        </button>
      </div>
    );
  }

  // 'authorized' state doesn't need explicit rendering as it navigates away.
  // Return null or a minimal placeholder if needed, though navigation should be quick.
  return null;
}
