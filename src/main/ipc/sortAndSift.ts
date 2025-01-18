import path from 'path';
import fs from 'fs';
import { SubjectKeeper } from 'renderer/src/components/context/app-provider';

const keepersPath = 'D:\\Photos\\Keepers\\';

const determineDestinationFolder = (keepers: SubjectKeeper[]) => {
  // Create a new folder in keepersPath with the name of the first keepers folder path after Photos\\
  const firstKeeper = keepers[0];
  const firstImagePackage = firstKeeper.imagePackages[0];
  const folderPath = firstImagePackage.jpegPath;
  const folderName = folderPath.split('Photos\\')[1].split('\\')[0];
  const destinationFolder = path.join(keepersPath, folderName);
  return destinationFolder;
};

export const sortAndSift = (keepers: SubjectKeeper[]) => {
  // For each keeper, move the keeper's imagePackages to the destination folder
  const destinationFolder = determineDestinationFolder(keepers);
  console.log('destinationFolder: ', destinationFolder);
  // If the destination folder doesn't exist, create it
  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder);
  }

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

      // nefs are deleted in a batch below
      //   if (imagePackage.nefPath) {
      //     fs.unlinkSync(imagePackage.nefPath);
      //   }
    });
  });

  // originalFolder is the path before the last \\ in the first keeper's jpegPath
  //   D:\\Photos\\PhotoSortNSiftTest\\DSC_0376.JPG
  const originalFolder = keepers[0].imagePackages[0].jpegPath
    .split('\\')
    .slice(0, -1)
    .join('\\');

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

  // @todo - delete the bigPreview and thumbnail files
};
