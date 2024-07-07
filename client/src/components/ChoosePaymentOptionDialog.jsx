import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Key, CreditCard, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChoosePaymentOptionDialog = ({
  isOpen,
  onClose,
  onSubmitKey,
  onPayNow,
}) => {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [anthropicKey, setAnthropicKey] = useState("");

  const handleKeySubmit = () => {
    onSubmitKey(anthropicKey);
    setAnthropicKey("");
    setShowKeyInput(false);
  };

  const handleBack = () => {
    setShowKeyInput(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {showKeyInput ? (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                Provide Anthropic Key
              </div>
            ) : (
              "Choose an Option"
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
                <span className="absolute top-2 right-2 bg-blue-600 text-xs font-semibold px-2 py-1 rounded">
                  Free
                </span>
                <Key className="w-12 h-12 mx-auto mb-2" />
                <h3 className="font-bold mb-2">Provide Anthropic key</h3>
                <p className="text-sm mb-4">
                  Use your personal Anthropic API key for website generation.
                </p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowKeyInput(true)}
                >
                  Free
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
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={onPayNow}
                >
                  Pay Now
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
              className="mt-4"
            >
              <Input
                type="text"
                placeholder="Enter your Anthropic API key"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                className="mb-2"
              />
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleKeySubmit}
              >
                Submit Key
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ChoosePaymentOptionDialog;
