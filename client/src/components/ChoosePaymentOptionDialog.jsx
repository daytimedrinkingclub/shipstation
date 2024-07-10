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
      <DialogContent className="bg-black text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {showKeyInput ? (
              <>
                <div className="flex items-center cursor-pointer" onClick={handleBack}>
                  <ArrowLeft height={24} width={24} className="mr-2" />
                  Provide Anthropic Key
                </div>
                <p className="text-sm text-gray-400 mt-2">
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
              <div className="bg-gray-800 p-4 rounded-lg text-center relative">
                <span className="absolute top-2 right-2 bg-green-600 text-xs font-semibold px-1 py-1 rounded">
                  Free
                </span>
                <Key className="w-12 h-12 mx-auto mb-2" />
                <h3 className="font-bold mb-2">Provide Anthropic key</h3>
                <p className="text-sm mb-4">
                  Use your personal Anthropic API key for website generation.
                </p>
                <Button
                  className="w-full"
                  onClick={() => setShowKeyInput(true)}
                >
                  Continue
                </Button>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center relative">
                <span className="absolute top-2 right-2 bg-gray-700 text-xs font-semibold px-2 py-1 rounded">
                  INR
                </span>
                <CreditCard className="w-12 h-12 mx-auto mb-2" />
                <h3 className="font-bold mb-2">Pay to create</h3>
                <p className="text-sm mb-4">
                  Secure payment for website generation service.
                </p>
                <RazorpayButton productId={productId} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="keyInput"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
              <div className="flex items-center space-x-2">
                <Input
                  type="password"
                  placeholder="Enter your Anthropic API key"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="flex-grow bg-primary text-white"
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
