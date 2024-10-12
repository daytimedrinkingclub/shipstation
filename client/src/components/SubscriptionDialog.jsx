import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Image, Globe, FileText, Crown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const SubscriptionDialog = ({ isOpen, onClose, isSubscribed, user }) => {
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [showConfetti, setShowConfetti] = useState(false);

  const planDetails = {
    monthly: {
      price: "$4",
      period: "per month",
      planId: "P-31N80695BE517244WM4AQH2I",
      description: "Monthly Subscription",
    },
    yearly: {
      price: "$38",
      period: "per year",
      planId: "P-7CH88240A4661311RM4AQIUI",
      description: "Yearly Subscription",
    },
  };

  const rzpPlanDetails = {
    monthly: {
      price: "₹190",
      period: "per month",
      subscriptionId: "plan_P50C6KoJZ5cCYY	", // Replace with actual monthly plan ID
      description: "Monthly Subscription",
    },
    yearly: {
      price: "₹999",
      period: "per year",
      subscriptionId: "plan_P6Aold8asDFAUk", // Replace with actual yearly plan ID
      description: "Yearly Subscription",
    },
  };

  const rzpKeys = {
    test: {
      key: "rzp_test_81n8IWzEnxvpwy",
    },
    prod: {
      key: "rzp_live_81n8IWzEnxvpwy",
    },
  };

  const getRzpKey = () => {
    if (process.env.NODE_ENV === "development") {
      return rzpKeys.test.key;
    } else {
      return rzpKeys.prod.key;
    }
  };
  
  const currentPlan = planDetails[selectedPlan];

  const handleSubscribe = () => {
    const options = {
      key: getRzpKey(),
      subscription_id: currentPlan.subscriptionId,
      name: "ShipStation.ai",
      description: currentPlan.description,
      image: "https://app.shipstation.ai/assets/logo.png",
      handler: function (response) {
        console.log(response.razorpay_payment_id);
        console.log(response.razorpay_subscription_id);
        console.log(response.razorpay_signature);

        setShowConfetti(true);

        toast.success("Subscription successful!", {
          description: "Welcome to the premium plan!",
        });

        setTimeout(() => {
          onClose();
          setShowConfetti(false);
        }, 3000);
      },
      prefill: {
        email: user.email,
      },
      notes: {
        note_key_1: "Premium Portfolio Subscription",
        note_key_2: selectedPlan === "yearly" ? "Yearly Plan" : "Monthly Plan",
      },
      theme: {
        color: "#10B981",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };


  const handleSubscriptionApprove = (data, actions) => {
    return actions.subscription.get().then((details) => {
      console.log("Subscription completed", details);
      setShowConfetti(true);
      toast.success("Subscription successful!", {
        description: "Welcome to the premium plan!",
      });
      setTimeout(() => {
        onClose();
        setShowConfetti(false);
      }, 3000);
    });
  };

  useEffect(() => {
    // const script = document.createElement("script");
    // script.src = "https://checkout.razorpay.com/v1/checkout.js";
    // script.async = true;
    // document.body.appendChild(script);

    // return () => {
    //   document.body.removeChild(script);
    // };
  }, []);

  const renderSubscriptionContent = () => {
    if (!isSubscribed) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Upgrade to Premium</DialogTitle>
            <DialogDescription>
              Unlock powerful features to enhance your portfolio
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-start sm:gap-4 w-full">
            <Tabs
              value={selectedPlan}
              onValueChange={setSelectedPlan}
              className="mb-4 sm:mb-0"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">
                {currentPlan.price}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                {currentPlan.period}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 py-4">
            {[
              {
                icon: Zap,
                title: "Unlimited AI Refinements",
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
                className="flex items-start space-x-3 p-3 bg-slate-800/35 rounded-lg"
              >
                <feature.icon className="w-6 h-6 text-primary" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="flex items-center sm:justify-center w-full">
            <PayPalButtons
              key={selectedPlan}
              createSubscription={(data, actions) => {
                const currentPlan = planDetails[selectedPlan];
                return actions.subscription.create({
                  plan_id: currentPlan.planId,
                });
              }}
              onApprove={handleSubscriptionApprove}
              style={{ layout: "vertical", color: "blue" }}
            />
          </DialogFooter>
        </>
      );
    } else {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Your Subscription</DialogTitle>
            <DialogDescription>
              Manage your premium subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-semibold text-lg text-foreground">
                Current Plan: Premium
              </h3>
              <p className="text-sm text-muted-foreground">
                Next billing date: June 1, 2023
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Recent Invoices</h4>
              {[
                { date: "May 1, 2023", amount: "$9.99" },
                { date: "April 1, 2023", amount: "$9.99" },
              ].map((invoice, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-secondary rounded-lg"
                >
                  <div className="flex items-center space-x-2 text-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{invoice.date}</span>
                  </div>
                  <span className="text-foreground">{invoice.amount}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="flex justify-start">
            <Button variant="link">Cancel Subscription</Button>
          </DialogFooter>
        </>
      );
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          "Abfx2fBz2b8Zos3YenEPUvpAS1OF_6HwAaJpnHw535oNJaRHoTE_j-XWrw0z04OUXi63fIn7bMbeMopf",
        vault: true,
      }}
    >
      {showConfetti && <Confetti />}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {renderSubscriptionContent()}
        </DialogContent>
      </Dialog>
    </PayPalScriptProvider>
  );
};

export default SubscriptionDialog;
