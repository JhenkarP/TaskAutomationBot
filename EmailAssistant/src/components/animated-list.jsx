//TaskAutomationBots\EmailAssistant\src\components\animated-list.jsx
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const AnimatedList = ({ children, className }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto flex flex-col space-y-2 ${className || ""}`}
      style={{ maxHeight: "500px" }} // fixed height
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
