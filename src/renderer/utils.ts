export const outDuplicatesById = <T extends { id: string }>(
  value: T,
  index: number,
  array: T[]
) => {
  return array.findIndex((item) => item.id === value.id) >= index;
};

/**
 * Converts a local file system path to a proper file:// URL
 * that works across Windows, macOS, and Linux.
 */
export const toFileUrl = (filePath: string) => {
  let pathName = filePath.replace(/\\/g, '/'); // Windows slashes
  if (!pathName.startsWith('/')) pathName = '/' + pathName;
  return `file://${pathName}`;
};
