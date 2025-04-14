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

  // Function to fetch user role
  const fetchUserRole = async (token: string, email: string) => {
    try {
      const response = await fetch("https://asubap-backend.vercel.app/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_email: email }),
      });
      const data = await response.json();
      console.log("User role data:", data);
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
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session data:", session);
        
        if (session?.user?.email) {
          await fetchUserRole(session.access_token, session.user.email);
          console.log("User role data:", role);
          console.log("access_token: " + session.access_token);
          console.log("user.email: " + session.user.email);
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
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event);
      setSession(newSession);
      
      if (newSession?.user?.email) {
        fetchUserRole(newSession.access_token, newSession.user.email);
      } else {
        setRole(null);
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