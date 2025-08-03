import { createContext, useContext, useState, ReactNode } from 'react';

interface IframeContextType {
  isOpen: boolean;
  url: string;
  title: string;
  openIframe: (url: string, title: string) => void;
  closeIframe: () => void;
}

const IframeContext = createContext<IframeContextType | undefined>(undefined);

export function IframeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const openIframe = (url: string, title: string) => {
    setUrl(url);
    setTitle(title);
    setIsOpen(true);
  };

  const closeIframe = () => {
    setIsOpen(false);
    setUrl('');
    setTitle('');
  };

  return (
    <IframeContext.Provider value={{
      isOpen,
      url,
      title,
      openIframe,
      closeIframe
    }}>
      {children}
    </IframeContext.Provider>
  );
}

export function useIframe() {
  const context = useContext(IframeContext);
  if (context === undefined) {
    throw new Error('useIframe must be used within an IframeProvider');
  }
  return context;
}