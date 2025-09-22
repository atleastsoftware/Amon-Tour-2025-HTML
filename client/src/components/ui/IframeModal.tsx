import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useIframe } from "@/contexts/IframeContext";
import { Button } from "@/components/ui/button";
import logoAmon from "@/assets/logo-amon.png";
export default function IframeModal() {
  const { t } = useTranslation();

  const {
    isOpen,
    url,
    title,
    closeIframe
  } = useIframe();
  return <AnimatePresence>
      {isOpen && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={closeIframe}>
          <motion.div initial={{
        scale: 0.95,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} exit={{
        scale: 0.95,
        opacity: 0
      }} transition={{
        duration: 0.2
      }} className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-3 flex-1 mr-4">
                <img src={logoAmon} alt={t('common.amonLogo')} className="h-8 w-auto" />
                <h2 className="text-lg font-semibold text-gray-800 truncate">
                  {title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={closeIframe} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Iframe Content */}
            <div className="flex-1 relative">
              {url && <iframe src={url} className="w-full h-full border-0" title={title} loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" />}
            </div>
          </motion.div>
        </motion.div>}
    </AnimatePresence>;
}