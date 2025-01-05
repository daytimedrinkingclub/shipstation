import { createContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { usePostHog } from 'posthog-js/react'

export const AuthContext = createContext({
  user: null,
  userLoading: false,
  supabase: null,
  availableShips: 0,
  recentlyShipped: [],
  isSubscribed: false,
  handleLogout: () => {},
  handleLogin: () => {},
  handleGoogleLogin: () => {},
  sendLoginLink: () => {},
  isSendingLoginLink: false,
  isLoading: false,
  myProjectsLoading: false,
  anthropicKey: "",
  setAnthropicKey: () => {},
  checkCustomDomain: () => {},
  getAvailableShips: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [availableShips, setAvailableShips] = useState(0);
  const [recentlyShipped, setRecentlyShipped] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [anthropicKey, setAnthropicKey] = useState("");
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseKey));
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingLoginLink, setIsSendingLoginLink] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [myProjectsLoading, setMyProjectsLoading] = useState(true);
  const posthog = usePostHog()

  const checkUser = async () => {
    setUserLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    setUserLoading(false);
    if (user) {
      posthog?.identify(user.id, {
        email: user.email,
      });
      
      await Promise.all([
        getAvailableShips(),
        getRecentlyShipped(),
        checkSubscriptionStatus(),
      ]);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("subscription_status")
        .single();

      if (error) throw error;

      const isActive = data.subscription_status === "active";
      setIsSubscribed(isActive);
      
      // Update PostHog properties with subscription status
      posthog?.people.set({
        subscription_status: data.subscription_status,
        is_subscribed: isActive
      });

      return isActive;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setIsSubscribed(false);
      return false;
    }
  };

  useEffect(() => {
    // Subscribe to realtime changes for subscription status
    const channel = supabase.channel('subscription_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user?.id}`,
        },
        (payload) => {
          setIsSubscribed(payload.new.subscription_status === "active");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getAvailableShips = async () => {
    try {
      let { data: user_profiles, error } = await supabase
        .from("user_profiles")
        .select("available_ships");

      if (error) {
        console.error("Error fetching available ships:", error);
        return 0;
      } 
      
      const ships = user_profiles[0]?.available_ships ?? 0;
      setAvailableShips(ships);
      return ships;
    } catch (error) {
      console.error("Error in getAvailableShips:", error);
      return 0;
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    posthog?.reset();
    toast("You have been logged out successfully!");
    setUser(null);
    setAvailableShips(0);
    setRecentlyShipped([]);
    setIsSubscribed(false);
    localStorage.clear();
    window.location.href = "/?logout=true";
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

  const checkCustomDomain = async (shipId) => {
    try {
      const { data, error } = await supabase
        .from("custom_domains")
        .select("*")
        .eq("ship_slug", shipId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error checking custom domain:", error);
      return null;
    }
  };

  const handleGoogleLogin = useCallback(
    async (response) => {
      try {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
        });

        if (error) throw error;

        setUser(data.user);
        // Identify user in PostHog after Google login
        posthog?.identify(data.user.id, {
          email: data.user.email,
          name: data.user.user_metadata?.full_name,
          login_method: 'google'
        });
        
        // Check subscription status and update PostHog
        await checkSubscriptionStatus();
        
        toast.success("Logged in successfully with Google!");
      } catch (error) {
        console.error("Error during Google login:", error);
        toast.error("Failed to log in with Google. Please try again.");
      }
    },
    [supabase.auth, posthog]
  );

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userLoading,
        supabase,
        availableShips,
        recentlyShipped,
        isSubscribed,
        handleLogout,
        handleLogin,
        handleGoogleLogin,
        sendLoginLink,
        isSendingLoginLink,
        isLoading,
        myProjectsLoading,
        anthropicKey,
        setAnthropicKey,
        checkCustomDomain,
        getAvailableShips,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
