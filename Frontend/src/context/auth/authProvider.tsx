import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient.ts";

interface AuthContextType {
  session: any;
  role: any;
  loading: boolean;
  setSession: (user: any) => void;
  setRole: (role: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check session on mount
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        // Fetch user role
        const token = session.access_token;
        fetch("http://localhost:3000/roles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_email: session.user.email }),
        }).then((response) => response.json())
          .then((data) => {
            // Check if data.role is an array and map over it to extract role values
            if (Array.isArray(data)) {
              const roles = data.map(item => item.role);
              setRole(roles);
            } 
          })
          .catch((error) => console.error("Error fetching role:", error))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session) {
        const token = session.access_token;
        fetch("http://localhost:3000/roles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_email: session.user.email }),
        })
          .then((response) => response.json())
          .then((data) => {
            // Check if data.role is an array and map over it to extract role values
            if (Array.isArray(data)) {
              const roles = data.map(item => item.role);
              setRole(roles);
            } 
          })
          .catch((error) => console.error("Error fetching role:", error))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, role, loading, setSession, setRole }}>
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