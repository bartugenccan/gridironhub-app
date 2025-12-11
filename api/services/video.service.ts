import { UploadVideoRequest, UploadVideoResponse } from '@/api/types/video';

/**
 * Video işlemlerini yöneten service
 * Backend hazır olana kadar mock implementasyon kullanılıyor
 */
class VideoService {
  /**
   * Workout'a video upload eder
   * @param request - workoutId ve video asset bilgileri
   * @returns Upload sonucu (success, videoUrl, thumbnailUrl)
   */
  async uploadWorkoutVideo(request: UploadVideoRequest): Promise<UploadVideoResponse> {
    // Mock implementation - 2 saniye bekle ve başarılı cevap döndür
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Mock video upload:', {
          workoutId: request.workoutId,
          videoSize: request.video.size,
          videoName: request.video.name,
        });

        // Sahte başarılı response
        resolve({
          success: true,
          videoUrl: request.video.uri, // Şimdilik local URI
          thumbnailUrl: request.video.thumbnail, // Şimdilik local thumbnail
        });
      }, 2000); // 2 saniye simülasyon
    });
  }
}

// Singleton instance - uygulama genelinde kullanılacak
export const videoService = new VideoService();
