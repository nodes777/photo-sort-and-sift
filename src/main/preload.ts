import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'ipc-example'
  | 'folder-selection'
  | 'processed-images'
  | 'sort-keepers'
  | 'sort-progress'
  | 'sort-complete';

contextBridge.exposeInMainWorld('electron', {
  ipcBridge: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    removeListener(channel: Channels, listener: (...args: unknown[]) => void) {
      ipcRenderer.removeListener(channel, listener);
    },
  },
});
