// TaskAutomationBots/EmailAssistant/src/components/AnimatedList.jsx
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const AnimatedList = ({ children, className, maxHeight = "500px" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const lastChild = containerRef.current.lastElementChild;
      lastChild?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto overflow-x-hidden flex flex-col space-y-2 ${className || ""}`}
      style={{ maxHeight }}
    >
      <AnimatePresence initial={true}>
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: index * 0.1,
            }}
            whileHover={{ scale: 1.03 }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
