/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */

// Native Dependency
import sharp from 'sharp';

import { readdir, readFile, existsSync } from 'fs';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

interface ImageData {
  id: string;
  data: string; // Base64
}

let mainWindow: BrowserWindow | null = null;
let selectedFolder: string | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

const sendImagesOnFolder = async (
  event: Electron.IpcMainEvent,
  folder: string
) => {
  const allImageFileNames = (await new Promise((resolve, reject) => {
    readdir(folder, (err, files) => {
      if (err) {
        console.error(`error reading folder ${folder}, `, err);
        reject(err);
      }
      const imageFiles = files.filter(
        (file) => file.endsWith('.jpg') || file.endsWith('.JPG')
      );
      resolve(imageFiles);
    });
  })) as string[];

  const getImageData = async (imagePath: string): Promise<ImageData[]> => {
    const compressedThumbnailPath = `${path.resolve(folder, imagePath)}_thumb`;
    const compressedImagePath = `${path.resolve(folder, imagePath)}_compressed`;

    // Check if this compressedThumbnailPath already exists, if so, no need to create a new file, assume we've already resized with sharp
    if (!existsSync(compressedThumbnailPath)) {
      await sharp(path.resolve(folder, imagePath))
        .resize(200, 200, { fit: 'contain' })
        .toFile(compressedThumbnailPath)
        .then(() => {
          // @todo - send a message back to client to describe loading state
          console.log(`Writing thumbnail ${compressedThumbnailPath}`);
        })
        .catch((err) =>
          console.error(
            `Error writing thumbnail ${compressedThumbnailPath} with sharp: \n ${err}`
          )
        );
    }

    if (!existsSync(compressedImagePath)) {
      await sharp(path.resolve(folder, imagePath))
        .resize(600, 400, { fit: 'contain' })
        .toFile(compressedImagePath)
        .then(() => {
          // @todo - send a message back to client to describe loading state
          console.log(`Writing ${compressedImagePath}`);
        })
        .catch((err) =>
          console.error(
            `Error writing image ${compressedImagePath} with sharp: \n ${err}`
          )
        );
    }

    const thumbnailPromise: Promise<ImageData> = new Promise(
      (resolve, reject) => {
        readFile(
          path.resolve(folder, compressedThumbnailPath),
          { encoding: 'base64' },
          (error, data) => {
            if (error) {
              console.error(`error reading image ${imagePath}, `, error);
              reject(error);
            }
            resolve({
              id: compressedThumbnailPath,
              data,
            });
          }
        );
      }
    );

    const compressedImagePromise: Promise<ImageData> = new Promise(
      (resolve, reject) => {
        readFile(
          path.resolve(folder, compressedImagePath),
          { encoding: 'base64' },
          (error, data) => {
            if (error) {
              console.error(`error reading image ${imagePath}, `, error);
              reject(error);
            }
            resolve({
              id: compressedImagePath,
              data,
            });
          }
        );
      }
    );

    return Promise.all([thumbnailPromise, compressedImagePromise]);
  };

  const allImagesArrOfArr = await Promise.all(
    allImageFileNames.map(getImageData)
  );
  const allImages = allImagesArrOfArr.flat();

  event.reply('processedImages', allImages);
};

ipcMain.on('folder-selection', async (event, args) => {
  // @todo - Choosing a folder always says "No files match your search" in the windows file browser, can this be less confusing?
  // We could show the files but we are trying to choose a folder, not a file
  if (!mainWindow) {
    console.error('folder-selection: no main window');
    return;
  }
  const changeFolder = args?.[0] === 'change-folder';
  if (!selectedFolder || changeFolder) {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    if (result.filePaths?.length) {
      [selectedFolder] = result.filePaths;
    }
  }
  if (selectedFolder) {
    event.reply('folder-selection', selectedFolder);
    sendImagesOnFolder(event, selectedFolder);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
