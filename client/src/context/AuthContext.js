import React, { createContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [supabase] = useState(() =>
    createClient(
      'https://rqyiibvcszfszmdhhgkg.supabase.co',
      'import.meta.env.SUPABASE_ANON_TOKEN'
    )
  );

  useEffect(() => {
    const session = supabase.auth.getSession();
    setUser(session?.user ?? null);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <AuthContext.Provider value={{ user, supabase }}>
      {children}
    </AuthContext.Provider>
  );
};
