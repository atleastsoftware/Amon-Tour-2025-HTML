import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useIframe } from "@/contexts/IframeContext";
import { Button } from "@/components/ui/button";
import logoAmon from "@/assets/logo-amon.png";
import { useEffect } from "react";

export default function IframeModal() {
  const { isOpen, url, title, closeIframe } = useIframe();

  // Lock body scroll when iframe is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9998] bg-white flex flex-col"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm relative z-[9999]">
            <div className="flex items-center gap-3 flex-1 mr-4">
              <img 
                src={logoAmon} 
                alt="Amon Logo" 
                className="h-8 w-auto"
              />
              <h2 className="text-lg font-semibold text-gray-800 truncate">
                {title}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={closeIframe}
              className="hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
          
          {/* Iframe Content - Full Height */}
          <div className="flex-1 relative">
            {url && (
              <iframe
                src={url}
                className="w-full h-full border-0"
                title={title}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}