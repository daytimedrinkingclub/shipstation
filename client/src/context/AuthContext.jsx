import React, { createContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [availableShips, setAvailableShips] = useState(0);
  const [recentlyShipped, setRecentlyShipped] = useState([]);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_TOKEN;
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseKey));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  // useEffect(() => {
  //   const { data: authListener } = supabase.auth.onAuthStateChange(
  //     async (event, session) => {
  //       setUser(session?.user ?? null);
  //       debugger;
  //       if (event === "SIGNED_IN") {
  //         checkUser();
  //       } else if (event === "SIGNED_OUT") {
  //         setUser(null);
  //         setAvailableShips(0);
  //         setRecentlyShipped([]);
  //       }
  //     }
  //   );

  //   return () => {
  //     authListener.subscription.unsubscribe();
  //   };
  // }, [supabase.auth]);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await getAvailableShips();
      await getRecentlyShipped();
    }
  };

  const getAvailableShips = async () => {
    let { data: user_profiles, error } = await supabase
      .from("user_profiles")
      .select("available_ships");

    if (error) {
      console.error("Error fetching available ships:", error);
    } else {
      setAvailableShips(user_profiles[0]?.available_ships ?? 0);
    }
  };

  const getRecentlyShipped = async () => {
    let { data: ships, error } = await supabase
      .from("ships")
      .select("slug")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching recently shipped:", error);
    } else {
      setRecentlyShipped(ships);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAvailableShips(0);
    setRecentlyShipped([]);
  };

  const handleLogin = async (email, password = null) => {
    setIsLoading(true);
    try {
      let result;
      if (password) {
        // Sign in with email and password
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        // Send magic link
        result = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
      }

      if (result.error) throw result.error;

      if (password) {
        await checkUser();
        return { success: true, message: "Login Successful" };
      } else {
        return { success: true, message: "Magic Link Sent" };
      }
    } catch (error) {
      console.error("Error:", error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, supabase, availableShips, recentlyShipped, handleLogout, handleLogin, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
