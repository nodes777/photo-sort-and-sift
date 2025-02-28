import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      ipcBridge: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: Channels,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: Channels, func: (...args: unknown[]) => void): void;
        removeListener(channel: Channels, func: (() => void) | undefined): void;
      };
    };
  }
}

export {};
