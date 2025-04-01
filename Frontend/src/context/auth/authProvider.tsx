import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient.ts";

interface AuthContextType {
  session: any;
  roles: any;
  setSession: (user: any) => void;
  setRoles: (roles: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [roles, setRoles] = useState<any>(null);

  useEffect(() => {
    // Check session on mount
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        // Fetch user roles
        const token = session.access_token;
        const response = await fetch("https://asubap-backend.vercel.app/roles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_email: session.user.email }),
        });

        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        } else {
          console.error("Failed to fetch roles:", response.status);
        }
      }
    };

    fetchUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session) {
        const token = session.access_token;
        fetch("https://asubap-backend.vercel.app/roles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_email: session.user.email }),
        })
          .then((response) => response.json())
          .then((data) => setRoles(data))
          .catch((error) => console.error("Error fetching roles:", error));
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, roles, setSession, setRoles }}>
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