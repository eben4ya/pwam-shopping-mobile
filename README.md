# pwam-shopping-mobile

Expo (React Native) mobile frontend for the PWAM Global Shopping List demo.

## Setup

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android/iOS) or press `a` for Android emulator.

## API URL

The API base URL is set at the top of `App.js`:

```js
// Android emulator → backend on host machine
const API = 'http://10.0.2.2:3000';

// iOS simulator or Expo Go on physical device → change to:
// const API = 'http://localhost:3000';
```

Requires the backend running at `http://localhost:3000` on the host machine.

## Features

- View all shopping list items (auto-refreshes every 3 seconds)
- Add items via the input form
- Tap checkbox to mark items as checked/unchecked
- Tap ✕ to delete an item (with confirmation dialog)
