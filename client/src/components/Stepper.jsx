import { Check } from "lucide-react";
import { motion } from "framer-motion";

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <motion.div
            key={step}
            className="flex flex-col items-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <motion.div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
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
                <Check size={20} />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </motion.div>
            <div className="text-xs font-medium mt-2 text-center w-20">
              {step}
            </div>
          </motion.div>
        ))}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 -z-10" />
        <motion.div
          className="absolute top-5 left-0 h-[2px] bg-primary -z-10"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
