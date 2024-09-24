import { useEffect, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import ShipForm from "./ShipForm";
import PortfolioContent from "./PortfolioContent";
import Stepper from "./Stepper";
import { motion, AnimatePresence } from "framer-motion";
import ShipContent from "./ShipContent";
import ShipDesign from "./ShipDesign";
import {
  setCurrentStep,
  setSections,
  setSocials,
} from "@/store/onboardingSlice";
import { toast } from "sonner";
import { useSocket } from "@/context/SocketProvider";
const steps = ["Prompt", "Content", "Design"];

export default function ShipOnboarding({ type }) {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const { currentStep } = useSelector((state) => state.onboarding);
  const userPrompt = useSelector((state) => state.onboarding.userPrompt);
  const portfolioType = useSelector((state) => state.onboarding.portfolioType);

  const { availableShips } = useContext(AuthContext);

  const handleNext = () => {
    if (currentStep === 0) {
      socket.emit("generateSiteContent", {
        userMessage: userPrompt,
        type: type,
        ...(type === "portfolio" ? { portfolioType: portfolioType } : null),
      });

      socket.on("siteContentGenerated", (response) => {
        dispatch(setSections(response.sections));
        dispatch(setSocials(response.socials));
        if (currentStep < steps.length - 1) {
          dispatch(setCurrentStep(currentStep + 1));
        }
      });
    } else {
      if (currentStep < steps.length - 1) {
        dispatch(setCurrentStep(currentStep + 1));
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ShipForm type={type} reset={() => dispatch(setCurrentStep(0))} />
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ShipContent type={type} />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ShipDesign />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.h1
        className="text-4xl sm:text-5xl font-bold text-primary my-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        What would you like to create today?
      </motion.h1>
      <Stepper steps={steps} currentStep={currentStep} />
      <motion.div
        className="mt-8 bg-card p-8 rounded-lg border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
      </motion.div>
      <div className="flex justify-between mt-8">
        {currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex items-center text-lg px-6 py-3"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          </motion.div>
        )}
        <motion.div
          className="ml-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={handleNext}
            // disabled={isProcessingPdf}
            className={`transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 group relative overflow-hidden text-lg px-6 py-3 ${
              currentStep === steps.length - 1
                ? "w-full sm:w-auto justify-center"
                : ""
            }`}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%]"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <span className="relative">
              {currentStep === steps.length - 1
                ? "Generate Project"
                : "Next Step"}
            </span>
            <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-180 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
