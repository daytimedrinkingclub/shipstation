import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function Stepper({ steps, currentStep, onStepClick }) {
  return (
    <div className="flex flex-col space-y-4">
      {steps.map((step, index) => (
        <motion.div
          key={step}
          className={`flex items-center cursor-pointer ${
            index <= currentStep ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => onStepClick(index)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <motion.div
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mr-3 transition-all duration-300 ${
              index < currentStep
                ? "bg-green-500 border-green-500 text-white"
                : index === currentStep
                ? "bg-primary border-primary text-primary-foreground"
                : "border-gray-300 text-gray-300"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {index < currentStep ? (
              <Check size={16} />
            ) : (
              <span className="text-xs font-semibold">{index + 1}</span>
            )}
          </motion.div>
          <div className="text-sm font-medium">{step}</div>
        </motion.div>
      ))}
    </div>
  );
}
