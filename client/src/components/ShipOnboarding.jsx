import { useEffect, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  X,
  ChevronLeft,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import ShipForm from "./ShipForm";
import Stepper from "./Stepper";
import { motion, AnimatePresence } from "framer-motion";
import ShipContent from "./ShipContent";
import ShipDesign from "./ShipDesign";
import {
  setCurrentStep,
  setSections,
  setSocials,
} from "@/store/onboardingSlice";
import { useSocket } from "@/context/SocketProvider";
import { useNavigate } from "react-router-dom";

const steps = ["Prompt", "Content", "Design"];

export default function ShipOnboarding({ type, reset }) {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentStep } = useSelector((state) => state.onboarding);
  const userPrompt = useSelector((state) => state.onboarding.userPrompt);
  const portfolioType = useSelector((state) => state.onboarding.portfolioType);
  const shipType = useSelector((state) => state.onboarding.shipType);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (currentStep === 0) {
      setIsGenerating(true);
      socket.emit("generateSiteContent", {
        userMessage: userPrompt,
        type: shipType,
        ...(type === "portfolio" ? { portfolioType: portfolioType } : null),
      });

      socket.on("siteContentGenerated", (response) => {
        dispatch(setSections(response.sections));
        dispatch(setSocials(response.socials));
        if (currentStep < steps.length - 1) {
          dispatch(setCurrentStep(currentStep + 1));
        }
        setIsGenerating(false);
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

  const handleStepClick = (stepIndex) => {
    dispatch(setCurrentStep(stepIndex));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ShipForm isGenerating={isGenerating} />;
      case 1:
        return <ShipContent />;
      case 2:
        return <ShipDesign />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border p-4 flex flex-col">
        <div className="flex gap-2 items-center mb-6">
          <Button variant="icon" size="icon" onClick={() => navigate("/")}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-xl font-bold">Ship Creation</h2>
        </div>
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="bg-card border-t border-border p-4 flex justify-between">
          {currentStep > 0 && (
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={isGenerating}
            className="ml-auto"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Generate Project
                <Sparkles className="ml-2 h-5 w-5" />
              </>
            ) : isGenerating ? (
              <>
                Generating Content...
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
