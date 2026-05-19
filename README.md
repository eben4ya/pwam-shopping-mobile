# pwam-shopping-mobile

React Native (Expo) mobile frontend for the **Global Shopping List** — a PWAM demo showing how one backend serves multiple platforms simultaneously.

Built with **Expo** (managed workflow) and **React Native**.

---

## Prerequisites

- Node.js ≥ 18
- npm
- [Expo Go](https://expo.dev/client) app on your phone **or** an Android/iOS emulator
- The backend running at `http://localhost:3000` (see [pwam-shopping-backend](https://github.com/eben4ya/pwam-shopping-backend))

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and set the correct API URL
cp .env.example .env

# 3. Start the Expo dev server
npx expo start
```

Then:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator (macOS only)
- Scan the QR code with **Expo Go** on your phone

---

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend API base URL |

Choose the right value for your setup:

```bash
# Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000

# iOS simulator or Expo Go on same machine
EXPO_PUBLIC_API_URL=http://localhost:3000

# Physical device (replace with your machine's local IP)
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

> **Never commit `.env` to version control.** Use `.env.example` as the template.
>
> All Expo public env vars must be prefixed with `EXPO_PUBLIC_` to be bundled into the app.

---

## Features

| Action | Gesture |
|---|---|
| View items (auto-refresh every 3 s) | Open app |
| Add item | Type in input → tap **+** or press Enter |
| Edit item | Tap **Edit** pill → edit in bottom sheet → Save |
| Check / uncheck item | Tap the circle on the right |
| Delete item | Tap anywhere on the item row → confirm in dialog |

---

## Project Structure

```
pwam-shopping-mobile/
├── .env.example   ← copy to .env
├── .gitignore
├── app.json       ← Expo app config
├── index.js       ← Expo entry point
└── App.js         ← full app (components + styles)
```

---

## AI Integration

The mobile app includes an **AI Suggest** bottom sheet that connects to the backend's `/ai/suggest` endpoint.

**How to use:**
1. Tap the **✨ Saran AI** button in the header to open the suggestion sheet.
2. Type a natural-language prompt (e.g., *"mau bikin rendang untuk 5 porsi"*).
3. The AI returns up to 8 suggested shopping items.
4. Tap **+ Tambah** next to any suggestion to add it directly to your list.

The feature works out of the box once the backend is running with a valid `OPENROUTER_API_KEY`. No extra mobile config is needed.

---

## Ideas for Improvement

- Split `App.js` into separate component files
- Add swipe-to-delete gesture (`react-native-gesture-handler`)
- Add offline support with `AsyncStorage`
- Add push notifications when the list is updated
- Build a standalone APK/IPA with `eas build`
