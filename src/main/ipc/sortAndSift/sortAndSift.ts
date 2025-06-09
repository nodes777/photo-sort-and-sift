import path from 'path';
import fs from 'fs';
import { SubjectKeeper } from 'renderer/src/components/context/app-provider';
import { createDescriptionsFile, determineDestinationFolder } from './utils';

export const sortAndSift = (
  event: Electron.IpcMainEvent,
  keepers: SubjectKeeper[]
) => {
  // For each keeper, move the keeper's imagePackages to the destination folder
  const destinationFolder = determineDestinationFolder(keepers);
  console.log('destinationFolder: ', destinationFolder);
  // If the destination folder doesn't exist, create it
  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder);
  }

  // Initialize progress
  const totalImages = keepers.reduce(
    (total, keeper) => total + keeper.imagePackages.length,
    0
  );
  let processedImages = 0;

  // @todo - send a message to the renderer to update the UI with the status of the sort and sift process
  // Copy the jpeg files and NEF files to the destination folder
  keepers.forEach((keeper) => {
    keeper.imagePackages.forEach((imagePackage) => {
      const jpegFileName = path.basename(imagePackage.jpegPath);
      const jpegDestinationPath = path.join(destinationFolder, jpegFileName);
      // @todo - make these async and run in parallel
      fs.copyFileSync(imagePackage.jpegPath, jpegDestinationPath);
      if (imagePackage.nefPath) {
        const nefFileName = path.basename(imagePackage.nefPath);
        const nefDestinationPath = path.join(destinationFolder, nefFileName);
        fs.copyFileSync(imagePackage.nefPath, nefDestinationPath);
      }
      // Delete the moved files from the original folder - imagePackage.jpegPath
      fs.unlinkSync(imagePackage.jpegPath);

      processedImages += 1;
      // Send message to the renderer to update the UI with the status of the sort and sift process
      const progress = Math.round((processedImages / totalImages) * 100);

      event.sender.send('sort-progress', {
        progress,
        message: `Processed ${processedImages}/${totalImages} images`,
      });
    });
  });

  // @todo: find a better way to do this. Probably by doing the grabbing of files from the SD card earlier in the process
  // originalFolder is the path before the last \\ in the first keeper's jpegPath
  //   D:\\Photos\\PhotoSortNSiftTest\\DSC_0376.JPG
  const firstKeeper = keepers[0];
  const firstImagePackage = firstKeeper.imagePackages[0];
  const { jpegPath } = firstImagePackage;

  // Get the directory name of the jpegPath
  const originalFolder = path.dirname(jpegPath);

  console.log('originalFolder: ', originalFolder);
  // Delete all the nef files in the original folder
  const nefFiles = fs
    .readdirSync(originalFolder)
    .filter((file) => file.endsWith('.NEF'));

  // @todo - make these async and run in parallel
  nefFiles.forEach((nefFile) => {
    const nefFilePath = path.join(originalFolder, nefFile);
    fs.unlinkSync(nefFilePath);
  });

  // delete all bigPreview and thumbnail files in the original folder
  // deleteBigPreviewAndThumbnailFiles(originalFolder);

  createDescriptionsFile(keepers);

  event.sender.send('sort-complete', {
    message: 'Sort and sift process complete!',
    destinationFolder,
  });
};
