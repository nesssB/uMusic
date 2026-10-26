# uMusic

A desktop client for YouTube Music, built with Electron, React and TypeScript.

> [!IMPORTANT]
> **uMusic is an unofficial, independent project.** It is not affiliated with,
> endorsed by, sponsored by or in any way connected to Google LLC, YouTube or
> YouTube Music.
>
> - "YouTube" and "YouTube Music" are trademarks of Google LLC. They are used
>   here only to describe what the app works with.
> - uMusic does not host, store or distribute any content. Everything you play
>   is streamed from YouTube Music, as it would be in your browser.
> - You are responsible for using the service in line with
>   [YouTube's Terms of Service](https://www.youtube.com/t/terms).
> - The software is provided "as is", without warranty of any kind. See the
>   [license](#license) for details.

## Status

Early development, so things will change often. Builds for Linux (AppImage and
.deb) and Windows are on the
[releases page](https://github.com/nesssB/uMusic/releases). The AppImage and
Windows builds update themselves; the .deb lets you know when a new version is
out.

## Requirements

- [Node.js](https://nodejs.org/) 24 or newer (see [.nvmrc](.nvmrc))
- npm

## Getting started

```bash
git clone https://github.com/nesssB/uMusic.git
cd uMusic
npm install
npm run dev
```

## Scripts

| Command               | What it does                                    |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Start the app in development mode with HMR      |
| `npm start`           | Preview the production build                    |
| `npm run build`       | Type-check and build the app                    |
| `npm run build:linux` | Package the app for Linux                       |
| `npm run build:win`   | Package the app for Windows                     |
| `npm run build:mac`   | Package the app for macOS                       |
| `npm run lint`        | Run ESLint                                      |
| `npm run typecheck`   | Run the TypeScript compiler for main + renderer |
| `npm run format`      | Format the code with Prettier                   |

## Built with

[![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![electron-vite](https://img.shields.io/badge/electron--vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://electron-vite.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## License

uMusic is free software, released under the
[GNU General Public License v3.0 or later](LICENSE).
