import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGlobalElementTranslations } from '@/hooks/useGlobalElementTranslations';

export default function PopupAnnouncement() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasClosedThisSession, setHasClosedThisSession] = useState(false);
  const [email, setEmail] = useState('');
  const { translateValue } = useGlobalElementTranslations();

  const { data: settings } = useQuery({
    queryKey: ['/api/public/theme-settings'],
  });

  const popupSettingsRaw = Array.isArray(settings) ? settings.find((s: any) => s.key === 'popup_settings')?.value : null;
  const popupConfigParsed = popupSettingsRaw ? (typeof popupSettingsRaw === 'string' ? JSON.parse(popupSettingsRaw) : popupSettingsRaw) : {
    enabled: false,
    type: 'newsletter',
    title: 'Subscribe to our Newsletter',
    description: 'Get the latest updates and offers',
    button_text: 'Subscribe',
    delay: 5000
  };
  
  // Translate popup config
  const popupConfig = {
    ...popupConfigParsed,
    title: translateValue('popup', 'title', popupConfigParsed.title || ''),
    description: translateValue('popup', 'description', popupConfigParsed.description || ''),
    button_text: translateValue('popup', 'button_text', popupConfigParsed.button_text || ''),
    email_placeholder: translateValue('popup', 'email_placeholder', 'Entrez votre email')
  };

  useEffect(() => {
    if (!popupConfig.enabled || hasClosedThisSession) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, popupConfig.delay || 5000);

    return () => clearTimeout(timer);
  }, [popupConfig.enabled, popupConfig.delay, hasClosedThisSession]);

  const handleClose = () => {
    setIsOpen(false);
    setHasClosedThisSession(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    handleClose();
  };

  if (!popupConfig.enabled) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="popup-announcement">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          data-testid="button-close-popup"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" data-testid="text-popup-title">
            {popupConfig.title}
          </DialogTitle>
          <DialogDescription className="text-base" data-testid="text-popup-description">
            {popupConfig.description}
          </DialogDescription>
        </DialogHeader>

        {popupConfig.type === 'newsletter' && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Input
              type="email"
              placeholder={popupConfig.email_placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-popup-email"
              className="w-full"
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              data-testid="button-popup-submit"
            >
              {popupConfig.button_text}
            </Button>
          </form>
        )}

        {popupConfig.type === 'promotion' && (
          <div className="mt-4">
            <Button 
              onClick={handleClose}
              className="w-full bg-primary hover:bg-primary/90"
              data-testid="button-popup-action"
            >
              {popupConfig.button_text}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
