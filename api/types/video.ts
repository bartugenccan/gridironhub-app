export interface VideoAsset {
  uri: string;
  type: string;
  name: string;
  size: number;
  duration?: number; // milisaniye cinsinden
  thumbnail?: string; // URI of the thumbnail image
}
