import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import ShipForm from "./ShipForm";
import Stepper from "./Stepper";
import { motion, AnimatePresence } from "framer-motion";
import ShipContent from "./ShipContent";
import ShipDesign from "./ShipDesign";

const steps = ["Project Type", "Prompt", "Content", "Design"];

export default function Component() {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectType, setProjectType] = useState("landing");
  const [shipConfig, setShipConfig] = useState(null);
  const { availableShips } = useContext(AuthContext);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-primary">
              Choose Project Type
            </h2>
            <p className="text-muted-foreground text-lg">
              Select the type of project you want to create:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["landing", "portfolio"].map((type) => (
                <motion.div
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setProjectType(type)}
                    variant={projectType === type ? "default" : "outline"}
                    className="w-full h-16 text-lg capitalize font-semibold"
                  >
                    {type}
                  </Button>
                </motion.div>
              ))}
            </div>
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
            <ShipForm type={projectType} reset={() => setCurrentStep(0)} />
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
            <ShipContent
              projectType={projectType}
              prompt={shipConfig?.prompt}
            />
          </motion.div>
        );
      case 3:
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
