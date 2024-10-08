import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Fuel,
  DraftingCompass,
  Check,
} from "lucide-react";
import PortfolioTypeSelector from "./PortfolioTypeSelector";
import CustomDesignPrompt from "./CustomDesignPrompt";

const steps = [
  { title: "Your Name", description: "Enter your full name", label: "Name" },
  {
    title: "Select Profession",
    description: "Choose your portfolio type",
    label: "Profession",
  },
  {
    title: "Design Prompt",
    description: "Describe your ideal portfolio design",
    label: "Design",
  },
];

export default function MobilePortfolioBuilder({
  name,
  setName,
  portfolioType,
  setPortfolioType,
  customDesignPrompt,
  setCustomDesignPrompt,
  isGenerating,
  handleSubmit,
  availableShips,
  onOpenPromptGallery,
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full"
            disabled={isGenerating}
          />
        );
      case 1:
        return (
          <PortfolioTypeSelector
            portfolioType={portfolioType}
            setPortfolioType={setPortfolioType}
            isGenerating={isGenerating}
            isMobile={true}
          />
        );
      case 2:
        return (
          <>
            <CustomDesignPrompt
              customDesignPrompt={customDesignPrompt}
              setCustomDesignPrompt={setCustomDesignPrompt}
              isGenerating={isGenerating}
            />
            <Button
              onClick={onOpenPromptGallery}
              disabled={isGenerating}
              size="sm"
              variant="outline"
              className="mt-2 w-full"
            >
              <DraftingCompass className="mr-2 h-4 w-4" />
              Open Prompt Gallery
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 w-full px-2">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className={`flex flex-col items-center ${
              index <= currentStep ? "text-primary" : "text-muted-foreground"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentStep(index)}
          >
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground"
              }`}
              initial={false}
              animate={{
                scale: index === currentStep ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </motion.div>
            <span className="text-xs font-medium">{step.label}</span>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">
          {steps[currentStep].title}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {steps[currentStep].description}
        </p>
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

      <div className="flex justify-between items-center">
        <Button
          onClick={prevStep}
          disabled={currentStep === 0}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isGenerating || availableShips <= 0}
            size="sm"
          >
            {isGenerating ? (
              "Generating..."
            ) : (
              <>
                Generate Portfolio
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={nextStep} size="sm">
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center">
        <Fuel className="mr-2 h-4 w-4" />
        <span className="text-sm">
          {availableShips} container{availableShips !== 1 && "s"} available
        </span>
      </div>
    </div>
  );
}
