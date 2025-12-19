---
description: How to build and deploy the app for testing
---

# Deploying for Testing (Staging/Production)

This workflow describes the steps to build and deploy your Expo app.

## Prerequisites

1.  **EAS CLI**: Ensure `eas-cli` is installed (`npm install -g eas-cli`).
2.  **Expo Account**: You need to be logged in (`eas login`).
3.  **App Configuration**: `app.config.ts` must have `ios.bundleIdentifier` and `android.package` set (Already done).
4.  **Developer Accounts**:
    - **iOS**: Apple Developer Account ($99/year).
    - **Android**: Google Play Console Account ($25 one-time).

## Steps

### 1. Initialize EAS Build

If you haven't already, run this command to generate `eas.json` and project ID.

```bash
// turbo
npx eas build:configure
```

### 2. Configure Build Profiles

Edit `eas.json` to define your build profiles. A common setup is:

- `development`: For running on your device (Expo Go or Dev Client).
- `preview`: For internal testing (APK / Simulator).
- `production`: For store submission (TestFlight / Play Store).

Example `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

### 3. Run Build

#### For Android (APK for testing)

```bash
npx eas build --platform android --profile preview
```

#### For iOS (TestFlight)

```bash
npx eas build --platform ios --profile production
```

_Note: This will prompt you to log in to your Apple account to set up certificates._

### 4. Submit to Store (Optional)

To automatically submit to TestFlight after building:

```bash
npx eas submit --platform ios
```
