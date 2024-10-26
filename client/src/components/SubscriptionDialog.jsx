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
import { initializePaddle } from "@paddle/paddle-js";
import { useToast } from "@/components/ui/use-toast";

const SubscriptionDialog = ({ isOpen, onClose, isSubscribed, user }) => {
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [showConfetti, setShowConfetti] = useState(false);
  const [paddle, setPaddle] = useState(null);
  const [prices, setPrices] = useState({
    monthly: null,
    yearly: null,
  });
  const { toast } = useToast();

  const fetchPrices = async (paddleInstance) => {
    const request = {
      items: [
        {
          priceId: import.meta.env.VITE_PADDLE_MONTHLY_PRICE_ID,
          quantity: 1,
        },
        {
          priceId: import.meta.env.VITE_PADDLE_YEARLY_PRICE_ID,
          quantity: 1,
        },
      ],
    };
    try {
      const pricePreview = await paddleInstance.PricePreview(request);
      console.log("Price Preview Response:", pricePreview);

      if (
        pricePreview &&
        pricePreview.data &&
        pricePreview.data.details &&
        pricePreview.data.details.lineItems
      ) {
        const monthlyPrice = pricePreview.data.details.lineItems.find(
          (item) => item.price.billingCycle.interval === "month"
        );
        const yearlyPrice = pricePreview.data.details.lineItems.find(
          (item) => item.price.billingCycle.interval === "year"
        );

        if (monthlyPrice && yearlyPrice) {
          setPrices({
            monthly: {
              amount: monthlyPrice.formattedTotals.total,
              period: "per month",
            },
            yearly: {
              amount: yearlyPrice.formattedTotals.total,
              period: "per year",
            },
          });
        } else {
          console.error(
            "Could not find monthly or yearly prices in the response"
          );
        }
      } else {
        console.error("Unexpected response structure from PricePreview");
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

  const handleSubscriptionSuccess = () => {
    setShowConfetti(true);
    toast({
      title: "Subscription Successful!",
      description:
        "Welcome to the premium features. Enjoy your upgraded experience!",
      duration: 5000,
    });
    setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
    onClose(); // Close the dialog
  };

  const handleSubscribe = () => {
    if (paddle) {
      paddle.Checkout.open({
        items: [
          {
            priceId:
              selectedPlan === "monthly"
                ? import.meta.env.VITE_PADDLE_MONTHLY_PRICE_ID
                : import.meta.env.VITE_PADDLE_YEARLY_PRICE_ID,
            quantity: 1,
          },
        ],
        customer: {
          email: user?.email,
        },
        theme: "dark",
        successCallback: handleSubscriptionSuccess,
        closeCallback: () => {
          console.log("Checkout closed");
        },
      });
    } else {
      console.error("Paddle is not initialized");
    }
    console.log("Subscribe");
  };

  useEffect(() => {
    initializePaddle({
      environment: import.meta.env.VITE_PADDLE_ENVIRONMENT,
      token: import.meta.env.VITE_PADDLE_KEY,
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
        fetchPrices(paddleInstance);
      }
    });
  }, []);

  const renderSubscriptionContent = () => {
    if (!isSubscribed) {
      return (
        <>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl">Upgrade to ShipStation Pro</DialogTitle>
            <DialogDescription className="text-gray-500">
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
                {prices[selectedPlan]?.amount || "Loading..."}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                {prices[selectedPlan]?.period || ""}
              </span>
            </div>
            {selectedPlan === "yearly" && (
              <span className="text-sm text-foreground font-semibold mt-1">
                Get two months free 🥰
              </span>
            )}
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
            <Button onClick={handleSubscribe}>Subscribe to Pro</Button>
          </DialogFooter>
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
    <>
      {showConfetti && <Confetti />}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {renderSubscriptionContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionDialog;
