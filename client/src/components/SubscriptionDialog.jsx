import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Confetti from "react-confetti";
import { initializePaddle } from "@paddle/paddle-js";
import { Zap, Image, Globe, Crown } from "lucide-react";
import { FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { format, addYears } from "date-fns";
import { Switch } from "@/components/ui/switch";

const SubscriptionDialog = ({ isOpen, onClose, isSubscribed, user }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [nextBillingDate, setNextBillingDate] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);

  const [paddle, setPaddle] = useState(null);
  const [isYearly, setIsYearly] = useState(true);

  // Define price IDs
  const monthlyItems = [
    {
      quantity: 1,
      priceId: import.meta.env.VITE_PADDLE_MONTHLY_PRICE_ID,
    },
  ];

  const yearlyItems = [
    {
      quantity: 1,
      priceId: import.meta.env.VITE_PADDLE_YEARLY_PRICE_ID,
    },
  ];

  const handleSubscriptionStatusChange = (payload) => {
    if (
      payload.new.subscription_status === "active" &&
      payload.old.subscription_status !== "active"
    ) {
      setTimeout(() => {
        // Track Google Ads conversion with subscription value
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-16577722230/BSWgCK-JyLMaEPbu7-A9',
            'value': isYearly ? 90.0 : 9.0,
            'currency': 'USD'
          });
        }

        setShowConfetti(true);
        toast.success(`Welcome to ${import.meta.env.VITE_APP_NAME} Pro! 🚀`, {
          description: "Your account has been upgraded successfully!",
          duration: 12000,
        });

        setTimeout(() => setShowConfetti(false), 3000);
      }, 10000);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("user_profiles_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_profiles",
          filter: `id=eq.${user?.id}`,
        },
        handleSubscriptionStatusChange
      )
      .subscribe();

    return () => {
      setIsPaymentLoading(true);
      supabase.removeChannel(channel);
    };
  };

  const fetchSubscriptionDetails = async () => {
    if (!user?.id || !isSubscribed) return;

    try {
      // Fetch user profile to get subscription start date
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("subscription_start_date")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData?.subscription_start_date) {
        const nextBilling = addYears(
          new Date(profileData.subscription_start_date),
          1
        );
        setNextBillingDate(nextBilling);
      }

      // Fetch recent payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (paymentsError) throw paymentsError;
      setRecentPayments(paymentsData || []);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toast.error("Failed to load subscription details");
    }
  };

  useEffect(() => {
    initializePaddle({
      environment: import.meta.env.VITE_PADDLE_ENVIRONMENT,
      token: import.meta.env.VITE_PADDLE_KEY,
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
        setIsPaymentLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    return setupRealtimeSubscription();
  }, [isOpen, isSubscribed, onClose, user?.id]);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, [user?.id, isSubscribed]);

  const handleCheckout = () => {
    paddle?.Checkout.open({
      items: isYearly ? yearlyItems : monthlyItems,
    });
  };

  const renderSubscriptionContent = () => {
    if (!isSubscribed) {
      return (
        <>
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl text-white text-center">
              Upgrade to {import.meta.env.VITE_APP_NAME} Pro
            </DialogTitle>

            {/* Pricing Toggle & Amount */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center gap-2 text-white">
                <span
                  className={`${!isYearly ? "font-bold" : "text-gray-400"}`}
                >
                  Monthly
                </span>
                <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                <span className={`${isYearly ? "font-bold" : "text-gray-400"}`}>
                  Yearly
                </span>
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {isYearly ? "$90.00/year" : "$9.00/month"}
                  </span>
                  {isYearly && (
                    <span className="text-xl text-emerald-400">Save 20%</span>
                  )}
                </div>
              </div>
            </div>

            <DialogDescription className="text-gray-400 text-center">
              Unlock powerful features to enhance your portfolio
            </DialogDescription>
          </DialogHeader>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-3 py-6">
            {[
              {
                icon: Zap,
                title: "Instant AI Refinements",
                description:
                  "Continuously improve your portfolio with AI assistance",
              },
              {
                icon: Globe,
                title: "Custom Domain",
                description: "Connect your own domain for better branding",
              },
              {
                icon: Image,
                title: "Unlimited Assets",
                description:
                  "Add as many images, videos, and files as you need",
              },
              {
                icon: Crown,
                title: "Premium Support",
                description: "Get priority assistance when you need it",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-[#1A1D23] rounded-lg"
              >
                <feature.icon className="w-5 h-5 text-white shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">{feature.title}</h4>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleCheckout}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Zap className="w-5 h-5" />
              <span>Upgrade Now</span>
            </button>
          </div>
        </>
      );
    } else {
      return (
        <>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl">Your Subscription</DialogTitle>
            <DialogDescription className="text-gray-500">
              Manage your premium subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-semibold text-lg text-foreground">
                Current Plan: Pro
              </h3>
              <p className="text-sm text-muted-foreground">
                Next billing date:{" "}
                {nextBillingDate
                  ? format(nextBillingDate, "MMMM d, yyyy")
                  : "Loading..."}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Recent Payments</h4>
              {recentPayments.length > 0 ? (
                recentPayments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-2 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center space-x-2 text-foreground">
                      <FileText className="w-4 h-4" />
                      <span>
                        {format(new Date(payment.created_at), "MMMM d, yyyy")}
                      </span>
                    </div>
                    {/* <span className="text-foreground">₹{payment.amount}</span> */}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No payment history available
                </p>
              )}
            </div>
          </div>
          {/* <DialogFooter className="flex justify-start">
            <Button variant="link">Cancel Subscription</Button>
          </DialogFooter> */}
        </>
      );
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 1000 }}
          numberOfPieces={500}
          recycle={false}
          gravity={0.2}
        />
      )}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0F1115] p-6">
          {renderSubscriptionContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionDialog;
