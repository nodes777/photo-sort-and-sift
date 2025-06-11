import * as fs from 'fs';
import { OutputInfo } from 'sharp';

import {
  readSharpImageData,
  readSharpImages,
} from '../../../main/imageProcessing/readSharpImages';
import { SharpOutput, ImageType } from '../../../main/types';

jest.mock('fs');

const defaultOutput: OutputInfo = {
  format: 'jpg',
  size: 12345,
  width: 100,
  height: 100,
  channels: 3,
  premultiplied: false,
};

const sampleSharpOutput: SharpOutput = {
  sharpFilePath: 'DSC_001.JPG_thumbnail.jpg',
  originalFilePath: 'DSC_001.JPG',
  type: ImageType.THUMBNAIL,
  orientation: 1,
  output: defaultOutput,
};

describe('readSharpImages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with correct ReadingSharpData', async () => {
    (fs.readFile as unknown as jest.Mock).mockImplementation((_, __, cb) => {
      cb(null, 'base64data');
    });

    const result = await readSharpImageData(sampleSharpOutput);
    expect(result).toEqual({
      sharpPathName: 'DSC_001.JPG_thumbnail.jpg',
      originalPathName: 'DSC_001.JPG',
      type: ImageType.THUMBNAIL,
      orientation: 1,
      data: 'base64data',
    });
  });

  it('should reject on read error', async () => {
    (fs.readFile as unknown as jest.Mock).mockImplementation((_, __, cb) => {
      cb(new Error('fail'), null);
    });

    await expect(readSharpImageData(sampleSharpOutput)).rejects.toThrow('fail');
  });

  it('readSharpImages returns array of promises resolving to correct data', async () => {
    (fs.readFile as unknown as jest.Mock).mockImplementation((_, __, cb) => {
      cb(null, 'base64data');
    });

    const outputs: SharpOutput[] = [
      { ...sampleSharpOutput },
      {
        ...sampleSharpOutput,
        sharpFilePath: 'DSC_002.JPG_thumbnail.jpg',
        originalFilePath: 'DSC_002.JPG',
      },
    ];
    const promises = readSharpImages(outputs);
    expect(promises.length).toBe(2);

    const results = await Promise.all(promises);
    expect(results[0].sharpPathName).toBe('DSC_001.JPG_thumbnail.jpg');
    expect(results[1].sharpPathName).toBe('DSC_002.JPG_thumbnail.jpg');
  });
});
