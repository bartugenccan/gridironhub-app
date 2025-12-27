import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from '@/contexts/ThemeContext';
import { VideoAsset } from '@/api/types/video';

interface VideoPreviewProps {
  video: VideoAsset;
  onRemove: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ video, onRemove }) => {
  const { colors } = useTheme();

  // Dosya boyutunu okunabilir formata çevir (24 MB, 1.5 GB)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Video süresini formatla (1:15, 2:30)
  const formatDuration = (ms?: number): string => {
    if (!ms) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      {/* Thumbnail Section */}
      <View style={styles.thumbnailContainer}>
        {video.thumbnail ? (
          <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnailPlaceholder, { backgroundColor: colors.border }]}>
            <Ionicons name="videocam" size={scale(40)} color={colors.textSecondary} />
          </View>
        )}

        {/* Play Icon Overlay */}
        <View style={styles.playIconContainer}>
          <Ionicons name="play-circle" size={scale(40)} color="white" />
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
          {video.name}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFileSize(video.size)}
          </Text>
          {video.duration && (
            <>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}> • </Text>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {formatDuration(video.duration)}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Remove Button */}
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Ionicons name="close-circle" size={scale(24)} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    borderRadius: scale(12),
    marginVertical: verticalScale(8),
  },
  thumbnailContainer: {
    position: 'relative',
    width: scale(80),
    height: scale(80),
    borderRadius: scale(8),
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  infoContainer: {
    flex: 1,
    marginLeft: scale(12),
  },
  fileName: {
    fontSize: scale(14),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: scale(12),
  },
  removeButton: {
    padding: scale(8),
  },
});
