"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseConfigured, getFirebaseAuth } from "@/lib/firebase";
import { getMobileSession } from "@/lib/api";

const FirebaseAuthContext = createContext({
  configured: false,
  loading: true,
  user: null,
});

export function FirebaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    Promise.resolve(getMobileSession()?.user || null).then((storedMobileUser) => {
      if (storedMobileUser) setUser(storedMobileUser);
      if (storedMobileUser || !firebaseConfigured) setLoading(false);
    });

    const handleMobileSession = (event) => {
      setUser(event.detail?.user || (firebaseConfigured ? getFirebaseAuth().currentUser : null));
      setLoading(false);
    };
    window.addEventListener("rentsell-auth-change", handleMobileSession);

    const unsubscribe = firebaseConfigured
      ? onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
          if (!getMobileSession()?.token) setUser(currentUser);
          setLoading(false);
        })
      : null;

    return () => {
      window.removeEventListener("rentsell-auth-change", handleMobileSession);
      unsubscribe?.();
    };
  }, []);

  const value = useMemo(
    () => ({ configured: firebaseConfigured, loading, user }),
    [loading, user]
  );

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  return useContext(FirebaseAuthContext);
}
