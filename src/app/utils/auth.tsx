import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  dob?: string;
  gender?: string;
  blood_group?: string;
  abha_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  chronic_illnesses?: string[];
  last_known_latitude?: number;
  last_known_longitude?: number;
  onboarding_complete: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Check if we are running in sandboxed mock mode (real credentials missing)
  const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === "YOUR_SUPABASE_URL";

  // Load active session on mount
  useEffect(() => {
    if (isMockMode) {
      // LocalStorage Mock Auth Session Loader
      const mockSessionStr = localStorage.getItem("medvelo_mock_session");
      if (mockSessionStr) {
        try {
          const sess = JSON.parse(mockSessionStr);
          setSession(sess);
          setUser(sess.user);
          loadMockProfile(sess.user.id);
        } catch (e) {
          localStorage.removeItem("medvelo_mock_session");
        }
      }
      setIsLoading(false);
    } else {
      // Supabase Active Session Loader
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchCloudProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      });

      // Session listener channel
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchCloudProfile(session.user.id);
          } else {
            setProfile(null);
            setIsLoading(false);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isMockMode]);

  // Read profile records from cloud database
  const fetchCloudProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // If profile doesn't exist, create it inline
        if (error.code === "PGRST116" || error.message.includes("no rows")) {
          const newProfile: UserProfile = {
            id: userId,
            full_name: user?.user_metadata?.full_name || "Patient",
            onboarding_complete: false
          };
          
          const { error: insertError } = await supabase
            .from("user_profiles")
            .insert(newProfile);
            
          if (!insertError) {
            setProfile(newProfile);
          }
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err: any) {
      console.warn("Could not query public.user_profiles table. Launching mock profile fallback:", err.message);
      // Fail gracefully: load/create local mock profile in memory
      loadMockProfile(userId);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sandbox profile from LocalStorage
  const loadMockProfile = (userId: string) => {
    const key = `medvelo_mock_profile_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setProfile(JSON.parse(stored));
    } else {
      const defaultProfile: UserProfile = {
        id: userId,
        full_name: user?.user_metadata?.full_name || "Patient Profile",
        onboarding_complete: false
      };
      localStorage.setItem(key, JSON.stringify(defaultProfile));
      setProfile(defaultProfile);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      if (isMockMode) {
        loadMockProfile(user.id);
      } else {
        await fetchCloudProfile(user.id);
      }
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const logOut = async () => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        localStorage.removeItem("medvelo_mock_session");
        setSession(null);
        setUser(null);
        setProfile(null);
        toast.success("Successfully logged out (Sandbox).");
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        toast.success("Logged out successfully.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to log out.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        logOut,
        refreshProfile,
        isMockMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
