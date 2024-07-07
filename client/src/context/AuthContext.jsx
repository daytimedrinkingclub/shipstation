import React, { createContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_TOKEN;
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseKey));

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
