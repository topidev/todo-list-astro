import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;

}

type DeferredPrompt = BeforeInstallPromptEvent | null;

export function usePWAInstall() {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  

    useEffect(() => {
        // Detección de iOS (más confiable que userAgent solo)
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

        setIsIOS(isAppleDevice && isSafari);

        // Chequea si ya está instalado (standalone = ya es PWA)
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches ||
                        ('standalone' in navigator && (navigator as any).standalone));


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
        if (deferredPrompt) {
            // Para Android/Chromium
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowInstallButton(false);
                setDeferredPrompt(null);
            }
        }
    };

    return { 
        showInstallButton: showInstallButton && !isStandalone, // no mostrar si ya instalado
        isIOS,
        isStandalone,
        install, 
    };
};