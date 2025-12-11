import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { VideoAsset } from '@/api/types/video';
import { Alert } from 'react-native';
import { set } from 'zod';

const MAX_VIDEO_DURATION = 120; // 120 SANIYE
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

interface UseVideoPickerResult {
  video: VideoAsset | null;
  isLoading: boolean;
  pickVideo: () => Promise<void>;
  clearVideo: () => void;
  compressVideo: (uri: string) => Promise<string>;
}

export const useVideoPicker = (): UseVideoPickerResult => {
  const [video, setVideo] = useState<VideoAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateThumbnail = async (uri: string): Promise<string | undefined> => {
    try {
      const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, {
        time: 1000,
      });
      return thumbnailUri;
    } catch (error) {
      console.error('Thumbnail oluşturulamadı:', error);
      return undefined;
    }
  };
  const compressVideo = async (uri: string): Promise<string> => {
    // Burada video sıkıştırma işlemi yapılabilir.
    // Şu an için orijinal URI'yi döndürüyoruz.
    console.log('video compression is not implemented', uri);
    return uri;
  };

  const pickVideo = async () => {
    try {
      setIsLoading(true); // Loading spinner

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your gallery to upload workout videos.'
        );

        setIsLoading(false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: MAX_VIDEO_DURATION,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsLoading(false);
        return;
      }
      const selectedVideo = result.assets[0];

      if (selectedVideo.fileSize && selectedVideo.fileSize > MAX_VIDEO_SIZE) {
        Alert.alert('File Too Large', 'Please select a video smaller than 50 MB.');
        setIsLoading(false);
        return;
      }
      if (selectedVideo.duration && selectedVideo.duration > MAX_VIDEO_DURATION * 1000) {
        Alert.alert('Video Too Long', 'Please select a video shorter than 120 seconds.');
        setIsLoading(false);
        return;
      }
      const thumbnailUri = await generateThumbnail(selectedVideo.uri);

      const videoAsset: VideoAsset = {
        uri: selectedVideo.uri,
        type: selectedVideo.type || 'video/mp4',
        name: selectedVideo.fileName || `video_${Date.now()}.mp4`,
        size: selectedVideo.fileSize || 0,
        duration: selectedVideo.duration ?? undefined,
        thumbnail: thumbnailUri,
      };
      setVideo(videoAsset);
      setIsLoading(false);
    } catch (error) {
      console.error('Video seçilirken hata oluştu:', error);
      Alert.alert('Error', 'An error occurred while selecting the video.');
      setIsLoading(false);
    }
  };

  const clearVideo = () => {
    setVideo(null);
  };

  return {
    video,
    isLoading,
    pickVideo,
    clearVideo,
    compressVideo,
  };
};
