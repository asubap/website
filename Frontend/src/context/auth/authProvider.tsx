import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient.ts";

interface AuthContextType {
  session: any;
  role: any;
  setSession: (user: any) => void;
  setRole: (role: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<any>(null);

  useEffect(() => {
    // Check session on mount
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        // Fetch user role
        const token = session.access_token;
        fetch("https://asubap-backend.vercel.app/roles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_email: session.user.email }),
        }).then((response) => response.json())
          .then((data) => {
            console.log(data);
            // Check if data.role is an array and map over it to extract role values
            if (Array.isArray(data)) {
              const roles = data.map(item => item.role);
              setRole(roles);
            } 
          })
          .catch((error) => console.error("Error fetching role:", error));
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
          .then((data) => {
            console.log(data);
            // Check if data.role is an array and map over it to extract role values
            if (Array.isArray(data)) {
              const roles = data.map(item => item.role);
              setRole(roles);
            } 
          })
          .catch((error) => console.error("Error fetching role:", error));
      }
      console.log(role)
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, role, setSession, setRole }}>
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