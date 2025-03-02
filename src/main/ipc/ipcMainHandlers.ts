import path from 'path';

import { ipcMain, dialog, BrowserWindow } from 'electron';
import { getJPGFileNames } from '../util';
import { generateSharpImages } from '../imageProcessing/generateSharpImages';
import { readSharpImages } from '../imageProcessing/readSharpImages';
import { formatImagesToPackages } from '../imageProcessing/packageImages';
import { CHANGE_FOLDER_EVENT, GeneratedFileNameEnding } from '../types';
import { sortAndSift } from './sortAndSift/sortAndSift';

let selectedFolder: string | null = null;

export const setupIpcHandlers = (mainWindow: BrowserWindow) => {
  ipcMain.on('folder-selection', async (event, args) => {
    const isChangeFolder = args?.[0] === CHANGE_FOLDER_EVENT;
    if (!selectedFolder || isChangeFolder) {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
      });
      if (result.filePaths?.length) {
        [selectedFolder] = result.filePaths;
      }
    }
    if (selectedFolder) {
      const window = BrowserWindow.getFocusedWindow();
      if (window) {
        window.setTitle(`Photo Sort N Sift - ${selectedFolder}`); // Update the app window's title
      }
      event.reply('folder-selection', selectedFolder);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      sendImagesOnFolder(event, selectedFolder);
    }
  });

  ipcMain.on('sort-keepers', async (event, args) => {
    sortAndSift(event, args);
  });
};

const sendImagesOnFolder = async (
  event: Electron.IpcMainEvent,
  folder: string
) => {
  // Get the paths in the folder
  const allJPGFileNames = await getJPGFileNames(folder);
  const allJPGFullFilePaths = allJPGFileNames
    .filter(
      // Filter out any file path names that look like we already generated them with sharp, @todo - is there a better way?
      (jpgFilePathName) =>
        !jpgFilePathName.endsWith(GeneratedFileNameEnding.THUMBNAIL) &&
        !jpgFilePathName.endsWith(GeneratedFileNameEnding.BIG_PREVIEW)
    )
    .map((jpgFileName) => path.resolve(folder, jpgFileName));
  console.log('allJPGFullFilePaths: \n', allJPGFullFilePaths);

  // Generate Sharp Images
  const sharpImageData = await Promise.all(
    generateSharpImages(allJPGFullFilePaths)
  );

  // Read the sharp images that we just generated
  const unpackagedImages = await Promise.all(readSharpImages(sharpImageData));

  // Package these images in a format that will allow us to read back the original jpg and nef paths
  const packagedImages = formatImagesToPackages(unpackagedImages);

  const allImagePackages = Object.values(packagedImages);

  event.reply('processed-images', allImagePackages);
};
