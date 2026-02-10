// global.d.ts
export {};

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent | null;
    BeforeInstallPromptEvent: any;
  }
}