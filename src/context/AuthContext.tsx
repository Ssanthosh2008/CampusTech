import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { getProfile, getSession, onAuthChange, signIn, signInAdmin, signOut } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithAdminPassword: (password: string) => Promise<{ error: Error | null }>;
  signOutUser: () => Promise<void>;
  resumePendingIntent: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const updateUserProfile = async (currentUser: User | null) => {
    setUser(currentUser);
    if (currentUser) {
      const p = await getProfile(currentUser.id);
      setIsAdmin(p.data?.is_admin === true);
    } else {
      setIsAdmin(false);
    }
  };

  const resumePendingIntent = (): boolean => {
    const destination = sessionStorage.getItem("campus-return-hash");
    const intent = sessionStorage.getItem("campus-intent");
    if (!destination && !intent) return false;

    sessionStorage.removeItem("campus-return-hash");
    sessionStorage.removeItem("campus-intent");
    window.location.hash = destination || "#/browse";
    return true;
  };

  useEffect(() => {
    let mounted = true;

    getSession().then(async (res) => {
      if (!mounted) return;
      const initialUser = res.data?.session?.user || null;
      await updateUserProfile(initialUser);
      setLoading(false);
    });

    const { data: authListener } = onAuthChange(async (_event, session) => {
      if (!mounted) return;
      const currentUser = session?.user || null;
      await updateUserProfile(currentUser);
      if (currentUser) {
        resumePendingIntent();
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const res = await signIn();
    if (!res.error && res.data?.user) {
      await updateUserProfile(res.data.user);
      resumePendingIntent();
    }
    return { error: res.error };
  };

  const signInWithAdminPassword = async (password: string) => {
    const res = await signInAdmin(password);
    if (!res.error && res.data?.user) {
      await updateUserProfile(res.data.user);
      resumePendingIntent();
    }
    return { error: res.error };
  };

  const signOutUser = async () => {
    await signOut();
    await updateUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        signInWithGoogle,
        signInWithAdminPassword,
        signOutUser,
        resumePendingIntent,
      }}
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

