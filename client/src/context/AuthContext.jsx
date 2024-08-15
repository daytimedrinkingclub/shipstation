import { createContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [availableShips, setAvailableShips] = useState(0);
  const [recentlyShipped, setRecentlyShipped] = useState([]);
  const [anthropicKey, setAnthropicKey] = useState("");
  const [websitesCount, setWebsitesCount] = useState(0);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseKey));
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingLoginLink, setIsSendingLoginLink] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [myProjectsLoading, setMyProjectsLoading] = useState(true);

  const checkUser = async () => {
    setUserLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    setUserLoading(false);
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
    setMyProjectsLoading(true);
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
    setMyProjectsLoading(false);
  };

  const getWebsitesCount = async () => {
    // implement
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast("You have been logged out successfully!");
    setUser(null);
    setAvailableShips(0);
    setRecentlyShipped([]);
    // Redirect to the home page
    window.location.href = "/";
  };

  const handleLogin = async (email, password = null) => {
    setIsLoading(true);
    try {
      let result = await supabase.auth.signUp({ email, password });
      if (result?.error?.message === "User already registered") {
        result = await supabase.auth.signInWithPassword({ email, password });
      }
      if (result.error) {
        return { success: false, message: result?.error?.message };
      }
      await checkUser();
      return { success: true, message: "Login Successful" };
    } catch (error) {
      console.error("Error:", error);
      return { success: false, message: error };
    } finally {
      setIsLoading(false);
    }
  };

  const sendLoginLink = async (email) => {
    if (!email) {
      return { success: false, message: "Please enter an email address" };
    }
    setIsSendingLoginLink(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: "Login link sent successfully" };
    } catch (error) {
      console.error("Error sending login link:", error);
      return { success: false, message: "Failed to send login link" };
    } finally {
      setIsSendingLoginLink(false);
    }
  };

  useEffect(() => {
    checkUser();
    getWebsitesCount();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userLoading,
        supabase,
        availableShips,
        recentlyShipped,
        handleLogout,
        handleLogin,
        sendLoginLink,
        isSendingLoginLink,
        isLoading,
        myProjectsLoading,
        anthropicKey,
        setAnthropicKey,
        websitesCount,
        getWebsitesCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
