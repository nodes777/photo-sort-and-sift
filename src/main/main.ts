import { app, BrowserWindow, net, protocol } from 'electron';
import { createMainWindow } from './app/createWindow';
import { setupAppEvents } from './app/appEvents';
import { setupUpdater } from './app/updater';
import { setupIpcHandlers } from './ipc/ipcMainHandlers';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;

// Register the custom protocol to serve images
const registerAppImagesProtocol = () => {
  protocol.handle('app-images', async (request) => {
    try {
      const filePath = decodeURIComponent(
        request.url.replace(/^app-images:\/\//, '/')
      );
      const normalizedPath = path.normalize(filePath);

      if (!fs.existsSync(normalizedPath)) {
        console.error('File not found:', normalizedPath);
        return new Response(null, { status: 404 });
      }

      // `net.fetch` can load local files via file:// URLs
      const response = await net.fetch(`file://${normalizedPath}`);
      return response;
    } catch (err) {
      console.error('Error handling app-images protocol:', err);
      return new Response(null, { status: 500 });
    }
  });
};

app
  .whenReady()
  .then(() => {
    // Register the app-images protocol
    registerAppImagesProtocol();
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
