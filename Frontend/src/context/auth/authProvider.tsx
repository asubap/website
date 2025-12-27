import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient.ts";
import { Session } from "@supabase/supabase-js";

// Define possible role types
type SponsorRole = {
  type: "sponsor";
  companyName: string;
};

export type RoleType = string | SponsorRole | null;

interface AuthContextType {
  session: Session | null;
  role: RoleType;
  loading: boolean;
  authError: string | null;
  isAuthenticated: boolean;
  setSession: (user: Session | null) => void;
  setRole: (role: RoleType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<RoleType>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Function to fetch user role
  const fetchUserRole = async (token: string, email: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_email: email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to authenticate" }));
        const errorMessage = errorData.error || "Failed to authenticate";

        // Auto sign-out archived or non-existent members
        // Clear state immediately to prevent auto-login after unarchiving
        setSession(null);
        setRole(null);
        setAuthError(errorMessage);

        // Sign out from Supabase - this clears all auth tokens and localStorage
        await supabase.auth.signOut({ scope: 'local' });

        // Force clear all Supabase-related localStorage keys
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      } else {
        const data = await response.json();
        setRole(data);
        setAuthError(null);
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      setAuthError("Network error. Please try again.");
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check session on mount
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.email) {
          await fetchUserRole(session.access_token, session.user.email);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, newSession) => {
        setSession(newSession);

        if (newSession?.user?.email) {
          fetchUserRole(newSession.access_token, newSession.user.email);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    // Periodic role validation - check every 30 seconds if user is still valid
    const roleValidationInterval = setInterval(async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (currentSession?.user?.email) {
        // Silently revalidate the user's role
        await fetchUserRole(currentSession.access_token, currentSession.user.email);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      authListener.subscription.unsubscribe();
      clearInterval(roleValidationInterval);
    };
  }, []);

  // User is truly authenticated only if they have both a session AND a valid role
  const isAuthenticated = !!session && !!role && !authError;

  return (
    <AuthContext.Provider
      value={{ session, role, loading, authError, isAuthenticated, setSession, setRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
