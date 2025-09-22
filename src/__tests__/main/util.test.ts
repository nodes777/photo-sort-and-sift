import path from 'path';
import {
  resolveHtmlPath,
  getJPGFileNames,
  validateExistingImage,
} from '../../main/util';
import { ExistingImage, ImageType } from '../../main/types';

jest.mock('fs', () => ({
  readdir: jest.fn(),
}));

const { readdir } = require('fs');

describe('resolveHtmlPath', () => {
  const originalEnv = process.env;
  beforeEach(() => {
    process.env = { ...originalEnv };
  });
  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns dev URL when NODE_ENV=development', () => {
    process.env.NODE_ENV = 'development';
    process.env.PORT = '3000';
    const result = resolveHtmlPath('index.html');
    expect(result).toBe('http://localhost:3000/index.html');
  });

  it('returns file URL when not in development', () => {
    process.env.NODE_ENV = 'production';
    const result = resolveHtmlPath('index.html');
    expect(result.startsWith('file://')).toBe(true);
    expect(result.endsWith(path.join('renderer', 'index.html'))).toBe(true);
  });
});

describe('getJPGFileNames', () => {
  it('resolves with only .jpg and .JPG files', async () => {
    readdir.mockImplementation(
      (_folder: string, cb: (err: Error | null, files: string[]) => void) => {
        cb(null, ['a.jpg', 'b.JPG', 'c.png', 'd.txt']);
      }
    );
    const files = await getJPGFileNames('/some/folder');
    expect(files).toEqual(['a.jpg', 'b.JPG']);
  });

  it('rejects on error', async () => {
    readdir.mockImplementation(
      (
        _folder: string,
        cb: (err: Error | null, files: string[] | null) => void
      ) => {
        cb(new Error('fail'), null);
      }
    );
    await expect(getJPGFileNames('/bad/folder')).rejects.toThrow('fail');
  });
});

describe('validateExistingImage', () => {
  const existingImage: ExistingImage = {
    sharpFilePath: 'foo.jpg',
    originalFilePath: 'bar.jpg',
    type: ImageType.THUMBNAIL,
  };

  it('rejects if error is present', async () => {
    const reject = jest.fn();
    await validateExistingImage(
      existingImage,
      new Error('fail'),
      'data',
      reject
    );
    expect(reject).toHaveBeenCalledWith(expect.any(Error));
  });

  it('does nothing if no error and data is present', async () => {
    const reject = jest.fn();
    await expect(
      validateExistingImage(existingImage, null, 'somedata', reject)
    ).resolves.toBeUndefined();
    expect(reject).not.toHaveBeenCalled();
  });
});
