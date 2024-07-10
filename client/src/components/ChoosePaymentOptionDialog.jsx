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

const ChoosePaymentOptionDialog = ({
  isOpen,
  onClose,
  onSubmitKey,
  onPayNow,
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

  const productId = productIds[type];
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark bg-background text-foreground border border-border sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">
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
                    href="https://github.com/daytimedrinkingclub/shipstation-backend/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/90 underline ml-1"
                  >
                    You can verify here. 
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
              <div className="bg-card p-6 rounded-lg text-center relative hover:bg-accent transition-colors duration-200" onClick={() => setShowKeyInput(true)}>
                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  Free
                </span>
                <Key className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-2 text-lg">Provide Anthropic key</h3>
                <p className="text-sm mb-4 text-muted-foreground">
                  Use your personal Anthropic API key for website generation.
                </p>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Continue
                </Button>
              </div>
              <div className="bg-card p-6 rounded-lg text-center relative transition-colors duration-200">
                <span className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-1 rounded">
                  Old money
                </span>
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-2 text-lg">Pay to create</h3>
                <p className="text-sm mb-4 text-muted-foreground">
                  Secure payment for website generation service.
                </p>
                <Button
                  className="w-full bg-secondary text-secondary-foreground cursor-not-allowed"
                  disabled
                >
                  Coming today
                </Button>
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
                  className="flex-grow bg-input text-foreground border-input focus:border-ring"
                />
                <Button onClick={handleKeySubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
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