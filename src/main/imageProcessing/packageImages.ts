import fs from 'fs';
import {
  ReadingSharpData,
  ImagePackage,
  ImageType,
  SafeSharpOutput,
} from '../types';

// @todo - handle lower case nef file extension
const getNEFPath = (jpegPath: string) => {
  const path = jpegPath.split('.');
  path.pop();
  if (!fs.existsSync(`${path.join('.')}.NEF`)) {
    console.warn(`NEF file not found for ${jpegPath}`);
    return undefined;
  }
  return `${path.join('.')}.NEF`;
};

export const formatImagesToPackagesPathsOnly = (images: SafeSharpOutput[]) => {
  const packages: { [id: string]: Partial<ImagePackage> } = {};

  images.forEach((img) => {
    const existing = packages[img.originalFilePath] || {
      id: img.originalFilePath,
      jpegPath: img.originalFilePath,
      nefPath: getNEFPath(img.originalFilePath),
      orientation: img.orientation,
    };

    if (img.type === ImageType.THUMBNAIL) {
      existing.thumbnail = { pathName: img.sharpFilePath };
    }
    if (img.type === ImageType.BIG_PREVIEW) {
      existing.bigPreview = { pathName: img.sharpFilePath };
    }

    packages[img.originalFilePath] = existing;
  });

  return Object.values(packages);
};
