import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  anthropicKey,
  setAnthropicKey,
  type,
  isKeyValidating,
}) => {
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleKeySubmit = () => {
    onSubmitKey(anthropicKey);
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
          <DialogTitle className="text-2xl font-bold mb-4 text-foreground">
            {showKeyInput ? (
              <>
                <div className="flex items-center cursor-pointer" onClick={handleBack}>
                  <ArrowLeft height={24} width={24} className="mr-2" />
                  Provide Anthropic Key
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <ShieldCheck className="inline-block mr-1 h-4 w-4" />
                  Your key is never stored on our servers.
                  <a
                    href="https://www.merge.dev/blog/anthropic-api-key"
                    target="_blank"
                    className="text-primary hover:text-primary/90 underline ml-1"
                  >
                    Get Anthropic API key
                  </a>
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
              <div className="bg-card text-card-foreground p-6 rounded-lg text-center relative hover:bg-accent hover:text-accent-foreground transition-colors duration-200" onClick={() => setShowKeyInput(true)}>
                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  Free
                </span>
                <Key className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-2 text-lg">Provide Anthropic key</h3>
                <p className="text-sm mb-4 text-muted-foreground">
                  Use your personal Anthropic API key for website generation.
                </p>
                <Button className="w-full">
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
              <div className="flex items-center space-x-2">
                <Input
                  type="password"
                  placeholder="Enter your Anthropic API key"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="flex-grow bg-background text-foreground border-input focus:border-ring"
                />
                <Button onClick={handleKeySubmit}>
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
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ChoosePaymentOptionDialog;