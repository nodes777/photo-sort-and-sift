import * as fs from 'fs';
import sharp, { Metadata, OutputInfo } from 'sharp';
import {
  generateSharpThumbnail,
  generateSharpBigPreview,
  readExistingImageData,
  generateSharpImages,
} from '../../../main/imageProcessing/generateSharpImages';
import { ImageType } from '../../../main/types';

jest.mock('sharp');
jest.mock('fs');

const defaultMetadata: Metadata = {
  orientation: 1,
  format: 'jpg',
  width: 100,
  height: 100,
  channels: 3,
  chromaSubsampling: '',
};

const defaultOutput: OutputInfo = {
  format: 'jpg',
  size: 12345,
  width: 100,
  height: 100,
  channels: 3,
  premultiplied: false,
};

const mockSharp = ({
  metadata,
  toFile,
}: {
  metadata?: jest.Mock<Promise<Metadata>>;
  toFile?: jest.Mock<Promise<OutputInfo>>;
} = {}) => {
  (sharp as unknown as jest.Mock).mockReturnValue({
    metadata: metadata || jest.fn().mockResolvedValue(defaultMetadata),
    resize: jest.fn().mockReturnThis(),
    withMetadata: jest.fn().mockReturnThis(),
    toFile: toFile || jest.fn().mockResolvedValue(defaultOutput),
  });
};

const expectedOutput = ({
  filePath,
  sharpFilePath,
  type,
  orientation = 1,
  output = defaultOutput,
}: {
  filePath: string;
  sharpFilePath: string;
  type: ImageType;
  orientation?: number;
  output?: OutputInfo;
}) => {
  return {
    originalFilePath: filePath,
    sharpFilePath,
    type,
    orientation,
    output,
  };
};

describe('generateSharpImages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSharp();
    (fs.readFile as unknown as jest.Mock).mockImplementation(
      (...args: any[]) => {
        const cb = args[args.length - 1];
        cb(null, 'data');
      }
    );
  });

  describe('generateSharpThumbnail', () => {
    it('should call sharp with correct args and return output', async () => {
      const metadataMock = jest.fn().mockResolvedValue({ orientation: 1 });
      const toFileMock = jest.fn().mockResolvedValue(defaultOutput);
      mockSharp({ metadata: metadataMock, toFile: toFileMock });
      const result = await generateSharpThumbnail(
        'DSC_001.JPG',
        'DSC_001.JPG_thumbnail.jpg'
      );
      expect(result).toMatchObject(
        expectedOutput({
          filePath: 'DSC_001.JPG',
          sharpFilePath: 'DSC_001.JPG_thumbnail.jpg',
          type: ImageType.THUMBNAIL,
        })
      );
      expect(toFileMock).toHaveBeenCalledWith('DSC_001.JPG_thumbnail.jpg');
    });
  });

  describe('generateSharpBigPreview', () => {
    it('should call sharp with correct args and return output', async () => {
      const metadataMock = jest.fn().mockResolvedValue({ orientation: 1 });
      const toFileMock = jest.fn().mockResolvedValue(defaultOutput);
      mockSharp({ metadata: metadataMock, toFile: toFileMock });
      const result = await generateSharpBigPreview(
        'DSC_001.JPG',
        'DSC_001.JPG_bigPreview.jpg'
      );
      expect(result).toMatchObject(
        expectedOutput({
          filePath: 'DSC_001.JPG',
          sharpFilePath: 'DSC_001.JPG_bigPreview.jpg',
          type: ImageType.BIG_PREVIEW,
        })
      );
      expect(toFileMock).toHaveBeenCalledWith('DSC_001.JPG_bigPreview.jpg');
    });
  });

  describe('readExistingImageData', () => {
    it('should read file and resolve with SharpOutput', async () => {
      mockSharp({ metadata: jest.fn().mockResolvedValue(defaultMetadata) });
      const result = await readExistingImageData({
        originalFilePath: 'DSC_001.JPG',
        sharpFilePath: 'DSC_001.JPG_thumbnail.jpg',
        type: ImageType.THUMBNAIL,
      });
      expect(result).toMatchObject({
        sharpFilePath: 'DSC_001.JPG_thumbnail.jpg',
        originalFilePath: 'DSC_001.JPG',
        type: ImageType.THUMBNAIL,
        orientation: 1,
        output: expect.objectContaining({
          format: 'jpg',
          width: 100,
          height: 100,
          channels: 3,
        }),
      });
      expect(fs.readFile as unknown as jest.Mock).toHaveBeenCalled();
    });
  });

  describe('generateSharpImages', () => {
    it('should generate images if they do not exist', async () => {
      (fs.existsSync as unknown as jest.Mock).mockReturnValue(false);
      const promises = generateSharpImages(['DSC_001.JPG']);
      expect(promises.length).toBe(2);
      const results = await Promise.all(promises);
      expect(results[0]).toMatchObject(
        expectedOutput({
          filePath: 'DSC_001.JPG',
          sharpFilePath: 'DSC_001.JPG_thumbnail.jpg',
          type: ImageType.THUMBNAIL,
        })
      );
      expect(results[1]).toMatchObject(
        expectedOutput({
          filePath: 'DSC_001.JPG',
          sharpFilePath: 'DSC_001.JPG_bigPreview.jpg',
          type: ImageType.BIG_PREVIEW,
        })
      );
    });
    it('should read existing images if they exist', async () => {
      (fs.existsSync as unknown as jest.Mock).mockReturnValue(true);
      mockSharp({ metadata: jest.fn().mockResolvedValue(defaultMetadata) });
      const promises = generateSharpImages(['DSC_001.JPG']);
      expect(promises.length).toBe(2);
      const results = await Promise.all(promises);
      expect(results[0]).toMatchObject({
        sharpFilePath: 'DSC_001.JPG_thumbnail.jpg',
        originalFilePath: 'DSC_001.JPG',
        type: expect.anything(),
        orientation: 1,
        output: expect.objectContaining({
          format: 'jpg',
          width: 100,
          height: 100,
          channels: 3,
        }),
      });
      expect(results[1]).toMatchObject({
        sharpFilePath: 'DSC_001.JPG_bigPreview.jpg',
        originalFilePath: 'DSC_001.JPG',
        type: expect.anything(),
        orientation: 1,
        output: expect.objectContaining({
          format: 'jpg',
          width: 100,
          height: 100,
          channels: 3,
        }),
      });
    });
    it('should generate only missing images', async () => {
      (fs.existsSync as unknown as jest.Mock).mockImplementation(
        (path: string) => !path.endsWith('_thumbnail.jpg')
      );
      const promises = generateSharpImages(['DSC_001.JPG']);
      expect(promises.length).toBe(2);
      const results = await Promise.all(promises);
      // One should be a generated thumbnail, one should be a read big preview
      expect(results[0].sharpFilePath).toBe('DSC_001.JPG_thumbnail.jpg');
      expect(results[1].sharpFilePath).toBe('DSC_001.JPG_bigPreview.jpg');
    });
  });
});
