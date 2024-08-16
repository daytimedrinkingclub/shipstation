import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, CreditCard, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RazorpayButton from "./RazorpayButton";
import PaypalButton from "./PaypalButton";

const ChoosePaymentOptionDialog = ({
  isOpen,
  onClose,
  onSubmitKey,
  apiKey,
  setApiKey,
  provider,
  setProvider,
  type,
  isKeyValidating,
}) => {
  const [showKeyInput, setShowKeyInput] = useState(false);


  const handleKeySubmit = () => {
    onSubmitKey(apiKey, provider);
  };

  const handleBack = () => {
    setShowKeyInput(false);
  };

  const landingPageProductRazorpayId = "pl_OTLsws336UXJ5J";
  const portfolioProductRazorpayId = "pl_OUUAfK88DxjZ8I";

  const productIds = {
    landing_page: landingPageProductRazorpayId,
    portfolio: portfolioProductRazorpayId,
  };

  const paypalProductIds = {
    landing_page: "3ZRLN4LJVSRVY",
    portfolio: "M3CSSZ43CE75J",
  };

  const productId = productIds[type];
  const paypalProductId = paypalProductIds[type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background text-foreground border border-border sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">
            {showKeyInput ? (
              <>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={handleBack}
                >
                  <ArrowLeft height={24} width={24} className="mr-2" />
                  Provide Your Key
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <ShieldCheck className="inline-block mr-1 h-4 w-4" />
                  Your key is never stored on our servers.
                </p>
              </>
            ) : (
              "Choose an option"
            )}
          </DialogTitle>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {!showKeyInput ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-4 mt-4"
            >
              <div
                className="bg-card p-6 rounded-lg text-center relative hover:bg-accent transition-colors duration-200"
                onClick={() => setShowKeyInput(true)}
              >
                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  Free
                </span>
                <Key className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-2 text-lg">
                  Provide Anthropic key
                </h3>
                <p className="text-sm mb-4 text-muted-foreground">
                  Use your personal Anthropic API key for website generation.
                </p>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Continue
                </Button>
              </div>
              <div className="bg-card text-card-foreground p-6 rounded-lg text-center relative transition-colors duration-200">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-2 text-lg">Pay to create</h3>
                <p className="text-sm mb-4 text-muted-foreground">
                  Secure payment for website generation service.
                </p>
                <Button
                  variant="secondary"
                  className="w-full cursor-not-allowed"
                  disabled
                >
                    Coming Soon
                </Button>
                {/* <RazorpayButton productId={productId} /> */}
                {/* <PaypalButton productId={paypalProductId} /> */}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="keyInput"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col space-y-4">
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-4">
                  <Input
                    type="password"
                    placeholder={`Enter your ${
                      provider === "anthropic" ? "Anthropic" : "OpenAI"
                    } API key`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-grow bg-input text-foreground border-input focus:border-ring"
                  />
                  <Button
                    onClick={handleKeySubmit}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isKeyValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Start shipping"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ChoosePaymentOptionDialog;
