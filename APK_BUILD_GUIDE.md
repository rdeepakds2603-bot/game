# THE FINAL SUNSET – ANDROID APK BUILD GUIDE 🎮📱

This game is fully optimized for **Android devices & mobile touchscreens** with:
- **Dual Touch Controls**: On-screen analog virtual joystick (Left) for walking RK + Touch Action Button (Right) for talking/examining.
- **Auto Screen Orientation**: Landscape lock with auto-rotation helper & safe-area notch support.
- **Offline PWA & WebAPK Ready**: Pre-configured `manifest.json`, `sw.js` service worker, and app icons.
- **Capacitor Android Configuration**: Pre-configured `capacitor.config.json` and `package.json`.

---

## METHOD 1: Build Native APK with Capacitor & Android Studio (Recommended)

### Step 1: Install Dependencies
Open your terminal in this game directory and run:
```bash
npm install
```

### Step 2: Add Android Platform
```bash
npx cap add android
```
*(This automatically creates a full Android Studio project inside the `android/` folder with all permissions and configurations set).*

### Step 3: Copy Assets & Sync
```bash
npm run cap:build
```

### Step 4: Open in Android Studio & Generate APK
```bash
npx cap open android
```
In Android Studio:
1. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. Once the build finishes, click **locate** to find your compiled `app-debug.apk`.
3. Transfer `app-debug.apk` to any Android phone and install!

---

## METHOD 2: Instant 1-Click APK using PWABuilder (No Android Studio Required)

Because this game includes a full PWA manifest and offline Service Worker, you can generate a production-ready signed `.apk` in 1 minute online:

1. Deploy or host this folder to any static hosting (e.g., GitHub Pages, Vercel, Netlify, or Firebase Hosting).
2. Go to **[PWABuilder.com](https://www.pwabuilder.com/)**.
3. Enter your game's URL and click **Start**.
4. Click **Package for Stores** > Select **Android (Google Play / APK)**.
5. Download the generated `.apk` package directly to your phone!

---

## METHOD 3: Direct APK Build via Bubblewrap CLI (Google TWA)

If you have Node.js and Java/Android CLI:
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest=manifest.json
bubblewrap build
```

---

## Features for Mobile / Android APK:
* **Analog Virtual Joystick**: Drag thumbstick on the left to move RK smoothly in all directions.
* **Smart Action Button**: Floating glowing button on the right pulses when near NPCs or items to talk/examine.
* **Tap-to-Advance**: Tap anywhere on the dialogue box to advance conversations.
* **Haptic Vibration**: Tactile feedback on taps, choices, and notifications.
* **Fullscreen Toggle**: In-game fullscreen button (⛶) for edge-to-edge display without browser bars.
* **Offline Storage**: Save slots and settings persist directly on the device.
