# 双陆移动 App

This directory contains the isolated Capacitor 8 toolchain and generated native projects for the Shuanglu mobile app.

## Architecture

- Shared game, state, and UI code remains in `../src`.
- Vite builds the native WebView bundle into `dist`.
- Capacitor copies `dist` into the generated iOS and Android projects.
- Online room requests use `https://shuanglu.uway.click/api/rooms`.
- Invite links continue to open the public Web build at `https://shuanglu.uway.click/?room=...`.
- The packaged app does not use Capacitor `server.url`; its interface is bundled locally.

## Requirements

- Node.js 22 for Capacitor 8 and Vite 8.
- iOS: macOS with Xcode 26 or newer.
- Android: Android Studio 2025.2.1 or newer and an installed Android SDK.

The production Next.js server can continue to use its existing Node.js 20 runtime. The mobile dependencies are isolated in this directory.

## Commands

From the repository root:

```bash
npm run mobile:build
npm run mobile:sync
```

From this directory:

```bash
npm run build
npm run native:sync
npm run native:open:ios
npm run native:open:android
```

`native:sync` always rebuilds the local WebView assets before copying them to both native projects.

## Local device verification

Build the standalone mobile bundle against a local Next.js backend, then expose both services to the LAN:

```bash
SHUANGLU_MOBILE_ORIGIN=http://YOUR_LAN_IP:3108 npm run build
cd ..
npm run start -- -p 3108
npm run mobile:preview
```

Open `http://YOUR_LAN_IP:4173` on a phone connected to the same network. This verifies the exact Vite/Capacitor WebView bundle rather than the Next.js page. Run `npm run mobile:sync` afterward to rebuild and restore the default production API origin before native packaging.

## App identity

```txt
App name: 双陆
Bundle/Application ID: click.uway.shuanglu
Orientation: portrait
```

Confirm the final Bundle/Application ID before creating App Store Connect or Google Play records. Replacing the generated placeholder app icon and splash assets is also required before distribution.
