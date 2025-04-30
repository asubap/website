import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../context/auth/supabaseClient";
import { useAuth } from "../../context/auth/authProvider";
import { useToast } from "../../context/toast/ToastContext";
import ConfirmDialog from "../common/ConfirmDialog";

const LogOut = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { showToast } = useToast();

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear session in context
      setSession(null);

      // Show success toast notification
      showToast("You have been successfully logged out", "success", 3000);

      // Navigate to home page using React Router
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error during sign out:", error);
      showToast("Failed to log out. Please try again.", "error");
    }
  };

  const handleLogoutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  return (
    <>
      <button
        onClick={handleLogoutClick}
        className="hover:text-bapred text-xl font-medium bg-transparent border-none cursor-pointer p-0"
      >
        Log Out
      </button>

      <ConfirmDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleSignOut}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
      />
    </>
  );
};

export default LogOut;
