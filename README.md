# Photo Sort And Sift

Photo Sort And Sift is a desktop application that allows users to select a folder of images, view them within the app, group related photos, delete photos, append metadata (tags, iNaturalist URL),and move selected photos to a seperate "Keepers" folder at the end of a flow.

Photo Sort And Sift is boilerplated from [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) using [Electron](https://electron.atom.io/), [React](https://facebook.github.io/react/), [React Router](https://github.com/reactjs/react-router), [Webpack](https://webpack.js.org/), and [React Fast Refresh](https://www.npmjs.com/package/react-refresh).

## Install

Clone the repo and install dependencies:

```bash
git clone https://github.com/nodes777/photo-sort-and-sift
cd photo-sort-and-sift
npm install
```

**Linux note:** On a first run on Linux it might not find `sharp`

```bash
npm install sharp --save
npx electron-rebuild -f -w sharp
```

**Having issues installing? See electron boilerplate's [debugging guide](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/400)**

## Starting Development

Start the app in the `dev` environment:

```bash
cd photo-sort-and-sift
npm start
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

## Instructions

1. After launching Photo Sort And Sift select a folder where your images are located
2. Navigate between selected photos with the arrow keys
3. Pressing space marks that photo as a keeper and prompts to name the keeper (subject of photo)
4. Pressing space on another photo marks that photo as a keeper and groups it with the previous photo
5. End a keeper group by pressing `Esc` or by pressing `n` on an un-grouped photo
6.

## Docs

- [Electron Docs](https://www.electronjs.org/docs/latest)
- [React Docs](https://reactjs.org/docs/getting-started.html)
- [Electron React Boilerplate Docs](https://electron-react-boilerplate.js.org/docs/installation)
- [iNaturalist API Docs](https://api.inaturalist.org/v1/docs/)
