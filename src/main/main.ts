import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './app/createWindow';
import { setupAppEvents } from './app/appEvents';
import { setupUpdater } from './app/updater';
import { setupIpcHandlers } from './ipc/ipcMainHandlers';

let mainWindow: BrowserWindow | null = null;

app
  .whenReady()
  .then(() => {
    mainWindow = createMainWindow();
    setupAppEvents(() => createMainWindow());
    setupUpdater();
    // eslint-disable-next-line promise/always-return
    if (mainWindow) setupIpcHandlers(mainWindow);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Error starting app', error);
  });
