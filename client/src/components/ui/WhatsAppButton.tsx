import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const controls = useAnimation();
  const isMobile = useIsMobile();
  
  // Pulse animation effect
  useEffect(() => {
    const pulseAnimation = async () => {
      if (!isHovered) {
        await controls.start({
          scale: 1.05,
          transition: { duration: 0.5 }
        });
        await controls.start({
          scale: 1,
          transition: { duration: 0.5 }
        });
      }
    };

    // Start pulse animation after 3 seconds, repeat every 15 seconds
    const timeout = setTimeout(() => {
      pulseAnimation();
      const interval = setInterval(pulseAnimation, 15000);
      return () => clearInterval(interval);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [controls, isHovered]);

  // Show tooltip only on desktop devices
  useEffect(() => {
    if (!isMobile && isHovered) {
      setIsTooltipVisible(true);
    } else {
      setIsTooltipVisible(false);
    }
  }, [isHovered, isMobile]);
  
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 flex items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 1
      }}
    >
      <AnimatePresence>
        {isTooltipVisible && (
          <motion.div
            className="mr-3 bg-white text-green-600 font-medium text-sm rounded-full py-2 px-4 shadow-md"
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: 20, width: 0 }}
          >
            Discutez avec nous en français !
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.a
        href="https://wa.me/66653496445"
        target="_blank"
        rel="noopener noreferrer"
        className={`bg-green-500 text-white rounded-full p-4 shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer
                   ${isMobile ? 'w-16 h-16' : 'w-14 h-14'}`}
        style={{ 
          boxShadow: isHovered 
            ? "0 0 20px rgba(74, 222, 128, 0.6), 0 8px 16px rgba(0, 0, 0, 0.15)" 
            : "0 4px 12px rgba(0, 0, 0, 0.15)"
        }}
        whileHover={{ 
          scale: 1.15,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        whileTap={{ scale: 0.95 }}
        animate={controls}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <i className={`fab fa-whatsapp ${isMobile ? 'text-3xl' : 'text-2xl'}`} style={{ pointerEvents: 'none' }} aria-hidden="true"></i>
        <span className="sr-only">Contact via WhatsApp</span>
      </motion.a>
    </motion.div>
  );
}

export default WhatsAppButton;