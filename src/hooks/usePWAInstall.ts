import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;

}

type DeferredPrompt = BeforeInstallPromptEvent | null;

export function usePWAInstall() {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt>(null);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Opcional: si ya está disponible al cargar (raro pero pasa en algunos casos)
    // if ('standalone' in navigator === false && 'BeforeInstallPromptEvent' in window) { ... }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Resultado instalación:', outcome); // "accepted" o "dismissed"
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  return { showInstallButton, install };
};