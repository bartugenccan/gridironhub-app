import type { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: 'GridIron Hub',
  slug: 'gridironhub-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/AppIcons/Assets.xcassets/AppIcon.appiconset/1024.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bartugenccan.gridironhubapp',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/AppIcons/playstore.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.bartugenccan.gridironhubapp',
  },
  web: {
    bundler: 'metro',
    favicon: './assets/images/favicon.png',
  },
  experiments: {
    tsconfigPaths: true,
  },
  plugins: [
    'expo-secure-store',
    [
      'expo-image-picker',
      {
        photosPermission: 'The app accesses your photos to let you upload workout videos.',
        cameraPermission: 'The app accesses your camera to let you record workout videos.',
      },
    ],
    'expo-video',
  ],
};

export default config;
