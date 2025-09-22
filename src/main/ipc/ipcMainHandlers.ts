import path from 'path';

import { ipcMain, dialog, BrowserWindow } from 'electron';
import { getJPGFileNames } from '../util';
import { generateSharpImages } from '../imageProcessing/generateSharpImages';
import { readSharpImages } from '../imageProcessing/readSharpImages';
import { formatImagesToPackages } from '../imageProcessing/packageImages';
import {
  CHANGE_FOLDER_EVENT,
  GeneratedFileNameEnding,
  ImageProcessingProgress,
} from '../types';
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

  const totalImages = allJPGFullFilePaths.length;
  // 2 sharp images (thumbnail + big preview) per file, then 1 read per sharp image
  const SHARP_IMAGES_PER_FILE = 2;
  const READS_PER_SHARP_IMAGE = 1;
  const totalSharpImages = totalImages * SHARP_IMAGES_PER_FILE;
  const totalReads = totalSharpImages * READS_PER_SHARP_IMAGE;
  const totalSteps = totalSharpImages + totalReads;

  // Helper function to emit progress
  const emitProgress = (step: string, current: number, fileName?: string) => {
    const progress: ImageProcessingProgress = {
      currentStep: step,
      current,
      total: totalSteps,
      percentage: Math.round((current / totalSteps) * 100),
      fileName,
    };
    event.reply('image-processing-progress', progress);
  };

  emitProgress('Starting image processing...', 0);

  // Generate Sharp Images with progress tracking
  const sharpImagePromises = generateSharpImages(allJPGFullFilePaths);
  const sharpImageData = [];
  let currentStep = 0;

  for (let i = 0; i < sharpImagePromises.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const result = await sharpImagePromises[i];
    const fileName = path.basename(result.originalFilePath);
    emitProgress(
      'Generating thumbnails and previews...',
      currentStep++,
      fileName
    );
    sharpImageData.push(result);
  }

  // Read the sharp images that we just generated with progress tracking
  emitProgress('Reading processed images...', currentStep);
  const unpackagedImages = [];
  const readPromises = readSharpImages(sharpImageData);

  for (let i = 0; i < readPromises.length; i++) {
    const fileName = path.basename(sharpImageData[i].originalFilePath);
    emitProgress('Reading processed images...', currentStep++, fileName);
    // eslint-disable-next-line no-await-in-loop
    const result = await readPromises[i];
    unpackagedImages.push(result);
  }

  // Package these images in a format that will allow us to read back the original jpg and nef paths
  emitProgress('Finalizing...', totalSteps);
  const packagedImages = formatImagesToPackages(unpackagedImages);
  const allImagePackages = Object.values(packagedImages);

  event.reply('processed-images', allImagePackages);
};
