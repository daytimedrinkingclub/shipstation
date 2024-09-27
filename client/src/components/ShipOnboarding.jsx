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
  Menu,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ChoosePaymentOptionDialog from "./ChoosePaymentOptionDialog";
import LoadingGameOverlay from "./LoadingGameOverlay";
import SuccessOverlay from "./SuccessOverlay";
import useDisclosure from "@/hooks/useDisclosure";
import { toast } from "sonner";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [deployedWebsiteSlug, setDeployedWebsiteSlug] = useState("");
  const [isKeyValidating, setIsKeyValidating] = useState(false);
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);

  const { user, availableShips, anthropicKey, setAnthropicKey } =
    useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isLoaderOpen,
    onOpen: onLoaderOpen,
    onClose: onLoaderClose,
  } = useDisclosure();
  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!userPrompt.trim()) {
        toast.info("Easy there, what do you want to make?");
        return;
      }
      if (availableShips <= 0) {
        setIsPaymentRequired(true);
        onOpen(); // Show payment options
        return;
      }
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
    } else if (currentStep === steps.length - 1) {
      // This is the final step, start the project
      if (availableShips <= 0) {
        setIsPaymentRequired(true);
        onOpen(); // Show payment options
      } else {
        startProject();
      }
    } else {
      if (currentStep < steps.length - 1) {
        dispatch(setCurrentStep(currentStep + 1));
      }
    }
  };

  const startProject = () => {
    try {
      socket.emit("startProject", {
        shipType: shipType,
        apiKey: anthropicKey,
        userPrompt: userPrompt,
        // Add other necessary data from the state
      });
      onClose();
      onLoaderOpen();
    } catch (error) {
      console.error("Error starting project:", error);
      toast.error("Failed to start the project. Please try again.");
    }
  };

  const handleSubmitAnthropicKey = (apiKey) => {
    socket.emit("anthropicKey", { anthropicKey: apiKey });
    setIsKeyValidating(true);
  };

  useEffect(() => {
    if (socket) {
      socket.on("apiKeyStatus", (response) => {
        setIsKeyValidating(false);
        if (response.success) {
          if (isPaymentRequired) {
            setIsPaymentRequired(false);
            handleNext(); // Proceed with the next step after successful payment
          } else {
            startProject();
          }
          toast.success("Anthropic key is valid, starting generation!");
        } else {
          toast.error(response.message);
        }
      });

      socket.on("showPaymentOptions", ({ error }) => {
        setIsPaymentRequired(true);
        onOpen();
      });

      socket.on("needMoreInfo", ({ message }) => {
        toast.warning("Please add more details regarding the website");
        onLoaderClose();
      });

      socket.on("websiteDeployed", ({ slug }) => {
        onSuccessOpen();
        onLoaderClose();
        setDeployedWebsiteSlug(slug);
      });

      return () => {
        socket.off("apiKeyStatus");
        socket.off("showPaymentOptions");
        socket.off("websiteDeployed");
        socket.off("needMoreInfo");
      };
    }
  }, [socket, anthropicKey, isPaymentRequired]);

  const handleBack = () => {
    if (currentStep > 0) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const handleStepClick = (stepIndex) => {
    dispatch(setCurrentStep(stepIndex));
  };

  const getStepName = (stepIndex) => {
    return steps[stepIndex] || "";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ShipForm isGenerating={isGenerating} reset={reset} />;
      case 1:
        return <ShipContent />;
      case 2:
        return <ShipDesign />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background relative">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"
        } fixed top-0 left-0 h-full bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out overflow-hidden z-50 md:relative md:translate-x-0`}
      >
        {isSidebarOpen && (
          <>
            <div className="flex flex-col p-4">
              <div className="flex items-center mb-2 md:mb-6">
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="icon"
                        size="icon"
                        onClick={() => navigate("/")}
                        className="mr-2 hidden md:flex"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                      <p>Back to Home</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <h2 className="text-xl font-bold">Ship Creation</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="ml-auto md:hidden"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="mb-6 md:hidden"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Stepper
                steps={steps}
                currentStep={currentStep}
                onStepClick={handleStepClick}
              />
            </div>
          </>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with menu button */}
        <div className="p-4 flex items-center justify-between md:justify-end">
          <Button
            variant="icon"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

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
              {getStepName(currentStep - 1)}
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
                {getStepName(currentStep + 1)}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <ChoosePaymentOptionDialog
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setIsPaymentRequired(false);
        }}
        onSubmitKey={handleSubmitAnthropicKey}
        anthropicKey={anthropicKey}
        setAnthropicKey={setAnthropicKey}
        type={shipType}
        isKeyValidating={isKeyValidating}
      />
      {isLoaderOpen && (
        <LoadingGameOverlay isOpen={isLoaderOpen} type={shipType} />
      )}
      <SuccessOverlay
        isOpen={isSuccessOpen}
        onClose={reset}
        slug={deployedWebsiteSlug}
      />
    </div>
  );
}
