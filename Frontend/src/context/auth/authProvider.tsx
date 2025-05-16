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
  setSession: (user: Session | null) => void;
  setRole: (role: RoleType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<RoleType>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      const data = await response.json();
      setRole(data);
    } catch (error) {
      console.error("Error fetching role:", error);
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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, role, loading, setSession, setRole }}
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
