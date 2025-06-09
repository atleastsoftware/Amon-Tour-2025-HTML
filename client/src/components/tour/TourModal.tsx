import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Loader2 } from "lucide-react";

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: string;
  tourName?: string;
}

export default function TourModal({ isOpen, onClose, tourId, tourName }: TourModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOpenExternal = () => {
    window.open(`https://www.tourninja.io/details/${tourId}`, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="fixed inset-4 bg-white rounded-lg shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {tourName || "Détails du tour"}
              </h2>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOpenExternal}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir dans un nouvel onglet
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contenu */}
            <div className="relative h-full" style={{ height: 'calc(100% - 73px)' }}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-gray-600">Chargement des détails du tour...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={handleOpenExternal} variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir dans un nouvel onglet
                    </Button>
                  </div>
                </div>
              )}

              <iframe
                src={`https://www.tourninja.io/details/${tourId}`}
                className="w-full h-full border-0"
                title="Détails du tour"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError("Impossible de charger les détails du tour");
                  setIsLoading(false);
                }}
                allow="fullscreen"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}