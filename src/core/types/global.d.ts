export {};

declare global {
  interface Window {
    lockSession?: (force?: boolean) => void;
    unlockSession?: () => void;
  }
}
