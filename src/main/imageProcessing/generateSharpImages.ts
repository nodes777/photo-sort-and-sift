import sharp, { Metadata } from 'sharp';
import { existsSync, readFile } from 'fs';
import {
  SharpOutput,
  GeneratedFileNameEnding,
  ImageType,
  ExistingImage,
  SafeSharpOutput,
} from '../types';
import { validateExistingImage } from '../util';
console.log('sharp.versions:', sharp.versions);\

const bigPreviewResoltion = { width: 1200, height: 800 };

export const generateSharpImagesPathsOnly = async (
  allJPGFullFilePaths: string[]
): Promise<SafeSharpOutput[]> => {
  const results: SafeSharpOutput[] = [];

  for (const jpgFilePath of allJPGFullFilePaths) {
    const thumbnailPath = `${jpgFilePath}${GeneratedFileNameEnding.THUMBNAIL}`;
    const bigPreviewPath = `${jpgFilePath}${GeneratedFileNameEnding.BIG_PREVIEW}`;

    // Generate thumbnail if missing, ignore returned output
    if (!existsSync(thumbnailPath)) {
      await sharp(jpgFilePath)
        .resize(200, 200, { fit: 'contain' })
        .withMetadata()
        .toFile(thumbnailPath);
    }
    results.push({
      originalFilePath: jpgFilePath,
      sharpFilePath: thumbnailPath,
      type: ImageType.THUMBNAIL,
      orientation: undefined,
    });

    // Generate big preview if missing, ignore returned output
    if (!existsSync(bigPreviewPath)) {
      await sharp(jpgFilePath)
        .resize(bigPreviewResoltion.width, bigPreviewResoltion.height, { fit: 'contain' })
        .withMetadata()
        .toFile(bigPreviewPath);
    }
    results.push({
      originalFilePath: jpgFilePath,
      sharpFilePath: bigPreviewPath,
      type: ImageType.BIG_PREVIEW,
      orientation: undefined,
    });
  }

  return results;
};
