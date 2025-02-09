import path from 'path';
import webpackPaths from '../configs/webpack.paths';
import fs from 'fs';

// Not sure why import doesn't work with rimraf, it's undefined if I use import
const rimraf = require('rimraf');

export default function deleteSourceMaps() {
  console.log('deleteSourceMaps.js - Checking sync operation...');

  // Find all the .js.map files in the distMainPath
  // const mainFiles = fs.readdirSync(webpackPaths.distMainPath);
  // mainFiles.forEach((file) => {
  //   if (file.endsWith('.js.map')) {
  //     const filePath = path.join(webpackPaths.distMainPath, file);
  //     console.log(`Deleting source map: ${filePath}`);
  //     rimraf.sync(filePath);
  //   }
  // });

  // // Do the same for distRendererPath
  // const rendererFiles = fs.readdirSync(webpackPaths.distRendererPath);
  // rendererFiles.forEach((file) => {
  //   if (file.endsWith('.js.map')) {
  //     const filePath = path.join(webpackPaths.distRendererPath, file);
  //     console.log(`Deleting source map: ${filePath}`);
  //     rimraf.sync(filePath);
  //   }
  // });

  console.log('Source maps deletion completed.');
}
