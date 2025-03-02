import sharp from 'sharp';

export interface ImageData {
  pathName: string; // path to the sharp generated image
  data: string; // Base64
}

export interface ImagePackage {
  id: string;
  jpegPath: string;
  nefPath?: string;
  thumbnail: ImageData;
  bigPreview: ImageData;
  orientation: number;
}

export type SharpOutput = {
  originalFilePath: string;
  sharpFilePath: string;
  type: ImageType;
  output: sharp.OutputInfo;
  orientation?: number;
};

export type ExistingImage = {
  sharpFilePath: string;
  originalFilePath: string;
  type: ImageType;
};

export type ReadingSharpData = {
  sharpPathName: string;
  originalPathName: string;
  type: ImageType;
  data: string;
  orientation?: number;
};

export enum ImageType {
  THUMBNAIL = 'THUMBNAIL',
  BIG_PREVIEW = 'BIG_PREVIEW',
}

export enum GeneratedFileNameEnding {
  THUMBNAIL = '_thumbnail.jpg',
  BIG_PREVIEW = '_bigPreview.jpg',
}

export const CHANGE_FOLDER_EVENT = 'change-folder';
