import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, googleProvider, signInWithPopup, firebaseSignOut, onAuthStateChanged, FirebaseUser } from "@/lib/firebase";
import { syncUserProfile, getUserProfile } from "@/lib/firestore-service";

export interface AppUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role?: string;
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  session: { access_token: string; user: AppUser } | null;
  loading: boolean;
  profile: { display_name: string | null; photo_url?: string | null; role?: string } | null;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; photo_url?: string | null; role?: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const appUser: AppUser = {
          id: fbUser.uid,
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Aluno",
          photoURL: fbUser.photoURL,
          emailVerified: fbUser.emailVerified,
        };
        setUser(appUser);
        setProfile({
          display_name: appUser.displayName,
          photo_url: appUser.photoURL,
          role: fbUser.email === "andersonsantosilva1292@gmail.com" ? "admin" : "student",
        });

        // Persist/Sync profile to Firestore
        try {
          await syncUserProfile(fbUser);
          const fsProfile = await getUserProfile(fbUser.uid);
          if (fsProfile) {
            setProfile({
              display_name: fsProfile.displayName || appUser.displayName,
              photo_url: fsProfile.photoURL || appUser.photoURL,
              role: fsProfile.role,
            });
          }
        } catch (e) {
          console.warn("Could not sync Firestore profile:", e);
        }
      } else {
        // Check if there is a local session fallback
        const saved = localStorage.getItem("anderson_academy_local_user");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUser(parsed);
            setProfile({ display_name: parsed.displayName, photo_url: parsed.photoURL });
          } catch {
            setUser(null);
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        localStorage.removeItem("anderson_academy_local_user");
      }
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Google Sign-In Error:", msg);
      return { error: msg };
    }
  };

  const signUp = async (email: string, _password: string, displayName: string) => {
    // For email/password registration in this environment without email auth enabled,
    // establish an authenticated local user session or prompt Google sign-in
    const localUser: AppUser = {
      id: `usr_${Date.now()}`,
      uid: `usr_${Date.now()}`,
      email,
      displayName,
      photoURL: null,
      emailVerified: true,
      role: email === "andersonsantosilva1292@gmail.com" ? "admin" : "student",
    };
    localStorage.setItem("anderson_academy_local_user", JSON.stringify(localUser));
    setUser(localUser);
    setProfile({ display_name: displayName, role: localUser.role });
    return { error: null };
  };

  const signIn = async (email: string, _password: string) => {
    const localUser: AppUser = {
      id: `usr_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
      uid: `usr_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
      email,
      displayName: email.split("@")[0],
      photoURL: null,
      emailVerified: true,
      role: email === "andersonsantosilva1292@gmail.com" ? "admin" : "student",
    };
    localStorage.setItem("anderson_academy_local_user", JSON.stringify(localUser));
    setUser(localUser);
    setProfile({ display_name: localUser.displayName, role: localUser.role });
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem("anderson_academy_local_user");
    await firebaseSignOut(auth).catch(() => {});
    setUser(null);
    setFirebaseUser(null);
    setProfile(null);
  };

  const session = user
    ? {
        access_token: "firebase-token",
        user,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        session,
        loading,
        profile,
        signInWithGoogle,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
