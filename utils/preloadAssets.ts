import { Asset } from 'expo-asset';
import { Image } from 'react-native';

/**
 * Preload all app assets to avoid loading delays during runtime
 * Call this function when the app starts
 */
export const preloadAssets = async (): Promise<void> => {
  const PRELOAD_TIMEOUT = 5000; // 5 seconds timeout

  const preloadPromise = (async () => {
    try {
      const imageAssets = [
        require('@/assets/images/login.png'),
        require('@/assets/images/sakarya-logo.png'),
        require('@/assets/images/icon.png'),
        require('@/assets/images/splash.png'),
        require('@/assets/images/welcome.png'),
      ];

      const cacheImages = imageAssets.map((image) => {
        return Asset.fromModule(image).downloadAsync();
      });

      await Promise.all(cacheImages);
      console.log('✅ All assets preloaded successfully');
    } catch (error) {
      console.warn('⚠️ Failed to preload some assets:', error);
      // We don't rethrow here to allow the app to boot even if some assets fail
    }
  })();

  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(() => {
      console.warn('🕒 Asset preloading timed out after', PRELOAD_TIMEOUT, 'ms');
      resolve();
    }, PRELOAD_TIMEOUT);
  });

  return Promise.race([preloadPromise, timeoutPromise]);
};
