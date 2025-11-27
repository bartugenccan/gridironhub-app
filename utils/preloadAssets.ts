import { Image } from 'react-native';

/**
 * Preload all app assets to avoid loading delays during runtime
 * Call this function when the app starts
 */
export const preloadAssets = async (): Promise<void> => {
  try {
    const imageAssets = [
      require('@/assets/images/login.png'),
      require('@/assets/images/sakarya-logo.png'),
      require('@/assets/images/icon.png'),
      require('@/assets/images/splash.png'),
    ];

    const cacheImages = imageAssets.map((image) => {
      return Image.prefetch(Image.resolveAssetSource(image).uri);
    });

    await Promise.all(cacheImages);
    console.log('✅ All assets preloaded successfully');
  } catch (error) {
    console.warn('⚠️ Failed to preload some assets:', error);
  }
};
