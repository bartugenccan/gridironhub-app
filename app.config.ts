import type { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: 'GridIron Hub',
  slug: 'gridironhub-app',
  owner: 'bartugenccan',
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
    bundleIdentifier: 'com.arionapps.gridironhubapp',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/AppIcons/playstore.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.arionapps.gridironhubapp',
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
    'expo-asset',
  ],
  extra: {
    eas: {
      projectId: 'fed09264-0585-4b29-98d1-be32ec2dae04',
    },
  },
};

export default config;
