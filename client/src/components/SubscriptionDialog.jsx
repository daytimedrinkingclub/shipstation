import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Image, Globe, FileText, XCircle, Crown } from "lucide-react";

const SubscriptionDialog = ({ isOpen, onClose, isSubscribed, user }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = () => {
    const options = {
      key: "rzp_test_81n8IWzEnxvpwy", // Replace with your actual Razorpay key
      subscription_id: "plan_P6BKzrKEJIctHZ", // Replace with actual subscription ID
      name: "ShipStation.ai",
      description: "Monthly Subscription",
      image: "https://app.shipstation.ai/assets/logo.png", // Replace with your logo path
      handler: function (response) {
        console.log(response.razorpay_payment_id);
        console.log(response.razorpay_subscription_id);
        console.log(response.razorpay_signature);
        // Handle successful payment here (e.g., update user's subscription status)
      },
      currency: "INR",
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone, // Assuming user object has these properties
      },
      notes: {
        note_key_1: "Premium Portfolio Subscription",
        note_key_2: "Unlimited features",
      },
      theme: {
        color: "#10B981", // Tailwind's emerald-500 color
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
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
          <DialogFooter className="flex justify-center">
            <Button className="" onClick={handleSubscribe}>
              Subscribe Now
            </Button>
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {renderSubscriptionContent()}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
