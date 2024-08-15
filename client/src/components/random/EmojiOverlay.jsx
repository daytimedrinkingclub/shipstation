import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const animationOptions = [
  {
    name: "wave",
    animate: {
      rotate: [0, 10, -10, 0],
      scale: [0, 1.2, 1],
      transition: { duration: 2, repeat: Infinity, repeatType: "reverse" },
    },
  },
  {
    name: "bounce",
    animate: {
      y: [0, -20, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  },
  {
    name: "spin",
    animate: {
      rotate: [0, 360],
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
    },
  },
  {
    name: "pulse",
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: { duration: 1.5, repeat: Infinity },
    },
  },
  {
    name: "zigzag",
    animate: (i) => ({
      x: [0, i % 2 === 0 ? 50 : -50, 0],
      y: [0, 50, 0],
      transition: { duration: 2, repeat: Infinity, repeatType: "reverse" },
    }),
  },
];

const EmojiOverlay = ({
  emoji = "🇮🇳",
  duration = 3000,
  count = 20,
  animationName = "wave",
}) => {
  const [show, setShow] = useState(true);
  const [selectedAnimation, setSelectedAnimation] = useState(
    animationOptions.find((option) => option.name === animationName) ||
      animationOptions[0]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const randomPosition = () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  });

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(count)].map((_, index) => (
            <motion.div
              key={index}
              initial={randomPosition}
              animate={
                selectedAnimation.name === "zigzag"
                  ? selectedAnimation.animate(index)
                  : selectedAnimation.animate
              }
              exit={{ opacity: 0, scale: 0, transition: { duration: 0.5 } }}
              className="absolute text-4xl sm:text-6xl md:text-7xl"
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

export default EmojiOverlay;
