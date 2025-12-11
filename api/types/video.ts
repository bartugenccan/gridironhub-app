export interface VideoAsset {
  uri: string;
  type: string;
  name: string;
  size: number;
  duration?: number; // milisaniye cinsinden
  thumbnail?: string; // URI of the thumbnail image
}

export interface UploadVideoRequest {
  workoutId: string;
  video: VideoAsset;
}

export interface UploadVideoResponse {
  success: boolean;
  videoUrl: string;
  thumbnailUrl?: string;
}
