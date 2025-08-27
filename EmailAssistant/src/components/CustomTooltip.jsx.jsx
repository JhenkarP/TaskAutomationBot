//TaskAutomationBots\EmailAssistant\src\components\CustomTooltip.jsx.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomTooltip({ children, content, position = "top" }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded-md shadow-md
              ${position === "top" ? "bottom-full left-1/2 -translate-x-1/2 mb-2" : ""}
              ${position === "bottom" ? "top-full left-1/2 -translate-x-1/2 mt-2" : ""}
              ${position === "left" ? "right-full top-1/2 -translate-y-1/2 mr-2" : ""}
              ${position === "right" ? "left-full top-1/2 -translate-y-1/2 ml-2" : ""}
            `}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
